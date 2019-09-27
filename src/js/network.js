import axios from 'axios';

const baseUrl = 'http://localhost:8080/api/v1/';
const appId = "project_b";
const secret = "IStFKAeRc0ccsuX7mMoJRHVejkr2FnY";

class Network {
    constructor() {
        this.requestQueue = [];
        this.waitRequest = false;
        this.accessToken = null;
        this.refreshToken = null;
    }

    post(url, data) {
        const config = {
            method: "POST",
            url: baseUrl + url,
            data: data
        }
        const promise = new Promise((resolve, reject) => {
            this.requestQueue.push({
                config: config,
                resolve: resolve,
                reject: reject
            });
            this.update();
        });
        return promise;
    }

    get(url) {
        const config = {
            method: "GET",
            url: baseUrl + url
        }
        const promise = new Promise((resolve, reject) => {
            this.requestQueue.push({
                config: config,
                resolve: resolve,
                reject: reject
            });
            this.update();
        });
        return promise;
    }

    update() {
        if (this.waitRequest || this.requestQueue.length == 0) {
            return;
        }

        this.waitRequest = true;

        const request = this.requestQueue.shift();
        request.config.headers = request.config.headers || {};
        request.config.headers.Authorization = "Bearer " + this.accessToken;

        axios.request(request.config)
        .then(result => {
            request.resolve(result.data);

            this.waitRequest = false;
            process.nextTick(this.update.bind(this));
        })
        .catch(error => {
            if (error.response && 
                error.response.status >= 400 && 
                error.response.status < 500) {
                console.log('need to refresh token');
                this.requestQueue.unshift(request);

                this.waitRequest = false;
                this.refresh();
            } else {
                request.reject(eror);

                this.waitRequest = false;
                process.nextTick(this.update.bind(this));
            }
        });
    }

    refresh() {
        // this.post()를 쓰면 안된다. 
        // 왜냐하면 얘는 여태 쌓인 큐를 무시하고 가장 먼저 실행되어야 하기 때문에.
        this.waitRequest = true;

        axios.post(baseUrl + 'auth/refresh', { token: this.refreshToken })
        .then(result => {
            this.accessToken = result.data.access_token;
            this.refreshToken = result.data.refresh_token;

            this.waitRequest = false;
            process.nextTick(this.update.bind(this));
        })
        .catch(error => {
            this.waitRequest = false;
            alert('로그인이 필요합니다.');
            location.reload();
        });
    }

    login(id, pw) {
        // this.post()를 쓰면 안된다. 
        // 왜냐하면 얘는 여태 쌓인 큐를 무시하고 가장 먼저 실행되어야 하기 때문에.
        const promise = new Promise((resolve, reject) => {
            this.waitRequest = true;

            const data = {
                id: id,
                password: pw,
                appid: appId,
                key: secret
            };

            axios.post(baseUrl + 'auth/signin', data)
            .then(result => {
                this.accessToken = result.data.access_token;
                this.refreshToken = result.data.refresh_token;

                this.waitRequest = false;
                resolve();
            })
            .catch(error => {
                this.waitRequest = false;
                reject(error);
            });
        });
        return promise;
    }

    loadNetworkStorage() {
        const config = {
            method: "GET",
            url: baseUrl + 'app/snapshot',
            params: { appid: appId, key: secret }
        }
        const promise = new Promise((resolve, reject) => {
            this.requestQueue.push({
                config: config,
                resolve: resolve,
                reject: reject
            });
            this.update();
        });
        return promise;
    }

    saveNetworkStorage(rawData) {
        const promise = new Promise((resolve, reject) => {
            const data = {
                appid: appId,
                key: secret,
                data: JSON.stringify(rawData)
            };

            this.post('app/snapshot', data)
            .then(resolve)
            .catch(reject);
        });
        return promise;
    }

    loadNetworkInventory() {
        const promise = new Promise((resolve, reject) => {
            this.get('wallet/assetlist')
            .then(result => {
                const itemListMap = {};
                result.forEach(asset => {
                    if (asset.appId == appId && !asset.locked) {
                        if (!itemListMap[asset.defId]) {
                            itemListMap[asset.defId] = [asset.assetId];
                        } else {
                            itemListMap[asset.defId].push(asset.assetId);
                        }
                    }
                });
                resolve(itemListMap);
            })
            .catch(reject)
        });
        return promise;
    }

    addAsset(itemId, count) {
        const promise = new Promise((resolve, reject) => {
            const defId = [];
            const propJson = [];
            for (let i = 0; i < count; ++i) {
                defId.push(itemId);
                propJson.push("");
            }
            
            const data = {
                appid: appId,
                key: secret,
                defid: defId,
                propjson: propJson
            }

            this.post('wallet/addasset', data)
            .then(resolve)
            .catch(reject);
        });
        return promise;
    }

    deleteAsset(assets) {
        const promise = new Promise((resolve, reject) => {
            const data = {
                appid: appId,
                key: secret,
                assetid: assets
            }

            this.post('wallet/destroyasset', data)
            .then(resolve)
            .catch(reject);
        });
        return promise;
    }
}

const NetworkAPI = new Network();
export default NetworkAPI;