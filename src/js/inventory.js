import Item from "./item";
import NetworkAPI from "./network";

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

    addItem(itemId, count) {
        count = count || 1;
        NetworkAPI.addAsset(itemId, count)
        .then(result => {
            if (!this.itemListMap[itemId]) {
                this.itemListMap[itemId] = [];
            }
            this.itemListMap[itemId].push(...result);
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
                this.itemListMap[itemId] = 
                itemList.filter(assetId => !assetsToDelete.includes(assetId));
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
