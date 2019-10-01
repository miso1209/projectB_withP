import Item from "./item";
import NetworkAPI from "./network";
import items from "./items";

function addItems(itemMap, itemId, assetIds) {
    if (!itemMap[itemId]) {
        itemMap[itemId] = [];
    }
    itemMap[itemId].push(...assetIds);
}

function deleteItems(itemMap, itemId, assetIds) {
    itemMap[itemId] = 
    itemMap[itemId].filter(assetId => !assetIds.includes(assetId));
}

export default class Inventory {
    constructor(storage) {
        this.storage = storage;
        this.itemListMap = {};
    }

    get gold() {
        return this.storage.data.gold;
    }

    set gold(value) {
        this.storage.setGold(value);
    }
    
    load(itemListMap) {
        this.itemListMap = itemListMap;
    }

    connectToWallet() {
        NetworkAPI.connectToWallet(
            (itemId, assetId) => {
                addItems(this.itemListMap, itemId, [assetId]);
            },
            (itemId, assetId) => {
                deleteItems(this.itemListMap, itemId, [assetId]);
            });
    }

    addItem(itemId, count = 1) {
        let itemIdWithoutRank = itemId;
        const propJson = {};
        if (/^\D/.test(itemId)) {
            const stringItemId = String(itemId);
            itemIdWithoutRank = stringItemId.substring(1);
            propJson.rank = stringItemId.substring(0, 1);
        }
        NetworkAPI.addAsset(itemIdWithoutRank, propJson, count)
        .then(result => {
            addItems(this.itemListMap, itemId, result);
        })
        .catch(error => {
            console.error('add item failed.', error);
        });
    }

    deleteItem(itemId, count = 1) {
        const itemList = this.itemListMap[itemId];
        if (itemList && itemList.length >= count) {
            const assetsToDelete = itemList.splice(0, count);
            NetworkAPI.deleteAsset(assetsToDelete)
            .then(() => {
                deleteItems(this.itemListMap, itemId, assetsToDelete);
            })
            .catch(error => {
                console.error('delete item failed.', error);
            });
        } else {
            throw new Error(`cannot deleteItem(${itemId}, ${count}): insufficient quantity.`);
        }
    }

    deleteCertainItem(itemId, assetId) {
        const itemList = this.itemListMap[itemId];
        if (itemList && itemList.includes(assetId)) {
            const assetsToDelete = [assetId];
            NetworkAPI.deleteAsset(assetsToDelete)
            .then(() => {
                deleteItems(this.itemListMap, itemId, assetsToDelete);
            })
            .catch(error => {
                console.error('delete certain item failed.', error);
            });
        } else {
            console.log('T.T', this.itemListMap);
            throw new Error(`cannot deleteCeratinItem(${itemId}, ${assetId}): cannot find asset.`);
        }
    }

    getCount(itemId) {
        const itemList = this.itemListMap[itemId];
        if (itemList) {
            return itemList.length;
        } else {
            return 0;
        }
    }

    forEach(callback) {
        for (const itemId in this.itemListMap) {
            const itemCategory = items[itemId].category;
            const isBundleItem = itemCategory == "consumables" ||
                                itemCategory == "material";
            if (isBundleItem) {
                const count = this.getCount(itemId);
                if (count > 0) {
                    callback(new Item(itemId, count));
                }
            } else {
                this.itemListMap[itemId].forEach(assetId => {
                    callback(new Item(itemId, 1, assetId));
                });
            }
        }
    }

    makeDirty() {
        this.dirty = true;
    }

    isDirty() {
        return this.dirty;
    }

    clearDirty() {
        return this.dirty = false;
    }
}
