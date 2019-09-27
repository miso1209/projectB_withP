import Item from "./item";
import NetworkAPI from "./network";

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

    addItem(itemId, count) {
        count = count || 1;
        NetworkAPI.addAsset(itemId, count)
        .then(result => {
            addItems(this.itemListMap, itemId, result);
        })
        .catch(error => {
            console.error('add item failed.', error);
        });
    }

    deleteItem(itemId, count) {
        // count 가 없으면 기본으로 1을 준다
        count = count || 1;
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
            const count = this.getCount(itemId);
            if (count > 0) {
                callback(new Item(itemId, count));
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
