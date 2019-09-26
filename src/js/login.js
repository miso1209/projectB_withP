import axios from 'axios';

const baseUrl = 'http://localhost:8080/api/v1/';

export default async function $login(id, password) {
    const request = 'auth/signin';
    const url = baseUrl + request;
    try {
        const result = await axios.post(url, { id: id, password: password });
        if (result.status == 200) {
            const data = result.data;
            const tokenMgr = new AccessTokenManager(data.access_token, data.refresh_token, data.expires_at);
            return new NetworkAPI(tokenMgr);
        } else {
            throw result;
        }
    } catch (e) {
        if (e.response) {
            console.error(`request(${request}) is failed. response status: ${e.response.status}`)
        }
        throw e;
    }
}

class AccessTokenManager {
    constructor(accessToken, refreshToken, expiresAt) {
        this.accessToken = accessToken;
        this.setRefreshTimer(refreshToken, expiresAt);
    }

    setRefreshTimer(refreshToken, expiresAt) {
        const expire = new Date(expiresAt);
        const now = new Date();
        const buffer = 60 * 1000; // 60초
        setTimeout(() => this.$refresh(refreshToken), expire.getTime() - now.getTime() - buffer);
    }

    async $refresh(refreshToken) {
        this.waitToRefresh = true;

        const request = 'auth/refresh';
        const url = baseUrl + request;
        try {
            const result = await axios.post(url, { token: refreshToken });
            if (result.status == 200) {
                const data = result.data;
                this.accessToken = data.access_token;
                this.setRefreshTimer(data.refresh_token, data.expires_at);
            } else {
                throw result;
            }
        } catch (e) {
            if (e.status) {
                console.error(`request(${request}) is failed. response status: ${e.response.status}`)
            }
            throw e;
        }

        this.waitToRefresh = false;
    }

    async $getAccessToken() {
        while (this.waitToRefresh) {
            await new Promise(resolve => setTimeout(resolve, 20));
        }
        return this.accessToken;
    }
}

const appId = "project_b";
const secret = "IStFKAeRc0ccsuX7mMoJRHVejkr2FnY/4KIdBMCUi7Y=";

class NetworkAPI {
    constructor(tokenMgr) {
        this.tokenMgr = tokenMgr;
    }

    async $getHeaders() {
        const accessToken = await this.tokenMgr.$getAccessToken();
        return { Authorization: 'Bearer ' + accessToken };
    }

    async $getOptions() {
        const headers = await this.$getHeaders();
        return { headers: headers };
    }

    async $loadNetworkStorage() {
        const request = 'app/snapshot';
        const url = baseUrl + request;
        try {
            const headers = await this.$getHeaders();
            const result = await axios.get(url, { headers: headers, params: { appid: appId, key: secret } });
            if (result.status == 200) {
                const data = result.data;
                console.log(`load network storage data completed. ${JSON.stringify(data)}`);
                return data.exists ? JSON.parse(data.data) : null;
            } else {
                throw result;
            }
        } catch (e) {
            if (e.status) {
                console.error(`request(${request}) is failed. response status: ${e.response.status}`);
            }
            throw e;
        }
    }

    async $saveNetworkStorage(data) {
        if (this.waitSaveStorage) {
            this.reservedSaveStorageData = data;
            return;
        }

        const request = 'app/snapshot';
        const url = baseUrl + request;
        try {
            this.waitSaveStorage = true;
            const options = await this.$getOptions();
            const result = await axios.post(url, { appid: appId, key: secret, data: JSON.stringify(data) }, options);
            if (result.status != 200) {
                throw result;
            }
            this.waitSaveStorage = false;
            console.log('saving storage to snapshot completed.');

            if (this.reservedSaveStorageData) {
                this.$saveNetworkStorage(this.reservedSaveStorageData);
                this.reservedSaveStorageData = null;
            }
        } catch (e) {
            if (e.status) {
                console.error(`request(${request}) is failed. response status: ${e.response.status}`)
            }
            throw e;
        }
    }

    async $loadNetworkInventory() {
        const request = 'wallet/assetlist';
        const url = baseUrl + request;
        try {
            const options = await this.$getOptions();
            const result = await axios.get(url, options);
            if (result.status == 200) {
                const itemListMap = {};
                const assetArray = result.data;
                assetArray.forEach(asset => {
                    if (asset.appId == appId) {
                        if (!itemListMap[asset.defId]) {
                            itemListMap[asset.defId] = [asset.assetId];
                        } else {
                            itemListMap[asset.defId].push(asset.assetId);
                        }
                    }
                });
                console.log(`load network inventory data completed.:\n${JSON.stringify(itemListMap)}`);
                return itemListMap;
            } else {
                throw result;
            }
        } catch (e) {
            if (e.status) {
                console.error(`request(${request}) is failed. response status: ${e.response.status}`);
            }
            throw e;
        }
    }

    async $saveNetworkInventory(queue) {
        if (this.waitSaveInventory) {
            if (!this.reservedSaveInventoryQueue) {
                this.reservedSaveInventoryQueue = [];
            }
            queue.forEach(element => this.reservedSaveInventoryQueue.push(element));
            return;
        }

        this.waitSaveInventory = true;
        const added = {};
        const deleted = {};
        for (let i = 0; i < queue.length; ++i) {
            const element = queue[i];
            console.log(`in saveNetworkInventory, element: ${JSON.stringify(element)}, at ${i}`);
            if (element.add) {
                var result = await this.$addAsset(element.add, element.count);
                if (!added[element.add]) {
                    added[element.add] = [];
                }
                result.forEach(asset => added[element.add].push(asset));
            } else if (element.delete) {
                await this.$deleteAsset(element.assets);
                if (!deleted[element.delete]) {
                    deleted[element.delete] = [];
                }
                element.assets.forEach(asset => deleted[element.delete].push(asset));
            }
        }

        this.waitSaveInventory = false;
        const reserved = this.reservedSaveInventoryQueue;
        this.reservedSaveInventoryQueue = null;
        return {
            added: added,
            deleted: deleted,
            reserved: reserved
        };
    }

    async $addAsset(itemId, count) {
        const defId = [];
        const propJson = [];
        for (let i = 0; i < count; ++i) {
            defId.push(itemId);
            propJson.push("");
        }
        
        const request = 'wallet/addasset';
        const url = baseUrl + request;
        try {
            console.log(`\trequest addasset(${itemId}, ${count})`);
            const options = await this.$getOptions();
            const result = await axios.post(url, { appid: appId, key: secret, defid: defId, propjson: propJson }, options);
            if (result.status != 200) {
                throw result;
            }
            console.log(`\tresponse addasset(${JSON.stringify(result.data)})`);
            return result.data;
        } catch (e) {
            if (e.status) {
                console.error(`request(${request}) is failed. response status: ${e.response.status}`)
            }
            throw e;
        }
    }

    async $deleteAsset(assets) {
        const request = 'wallet/destroyasset';
        const url = baseUrl + request;
        try {
            console.log(`\trequest deleteAsset(${JSON.stringify(assets)})`);
            const options = await this.$getOptions();
            const result = await axios.post(url, { appid: appId, key: secret, assetid: assets }, options);
            if (result.status != 200) {
                throw result;
            }
        } catch (e) {
            if (e.status) {
                console.error(`request(${request}) is failed. response status: ${e.response.status}`)
            }
            throw e;
        }
    }
}