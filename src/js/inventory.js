import Item from "./item";

export default class Inventory {
    constructor(gameAPI, storage) {
        this.gameAPI = gameAPI;
        this.storage = storage;
        this.itemListMap = {};
        this.syncQueue = [];
    }

    get gold() {
        return this.storage.data.gold;
    }

    set gold(value) {
        this.storage.setGold(value);
    }
    
    load(itemListMap) {
        this.itemListMap = itemListMap;
        console.log(`Inventory.load:\n${JSON.stringify(itemListMap)}`);
    }

    addItem(itemId, count) {
        count = count || 1;
        this.syncQueue.push({ add: itemId, count: count });
        this.save();
    }

    deleteItem(itemId, count) {
        // count 가 없으면 기본으로 1을 준다
        count = count || 1;
        const itemList = this.itemListMap[itemId];
        if (itemList && itemList.length >= count) {
            const assetsToDelete = itemList.splice(0, count);
            this.syncQueue.push({ delete: itemId, assets: assetsToDelete });
            this.save();
        } else {
            throw new Error(`cannot deleteItem(${itemId}, ${count}): insufficient quantity.`);
        }
    }

    save() {
        this.saveQueue(this.syncQueue);
        this.syncQueue = [];
    }

    saveQueue(queue) {
        console.log(`Inventory.saveQueue:\n${JSON.stringify(queue)}`);
        this.gameAPI.$saveNetworkInventory(queue)
        .then(result => {
            console.log(`Inventory.saved!:\n${JSON.stringify(result)}`);
            if (result && result.added) {
                for (const itemId in result.added) {
                    if (!this.itemListMap[itemId]) {
                        this.itemListMap[itemId] = [];
                    }
                    result.added[itemId].forEach(asset => this.itemListMap[itemId].push(asset));
                }
                console.log(`\tadded:${JSON.stringify(result.added)}`);
                console.log(`\t->:${JSON.stringify(this.itemListMap)}`);
            }
            if (result && result.deleted) {
                for (const itemId in result.deleted) {
                    this.itemListMap[itemId] = 
                    this.itemListMap[itemId].filter(assetId => result.deleted[itemId].includes(assetId));
                }
                console.log(`\tdeleted:${JSON.stringify(result.deleted)}`);
            }
            if (result && result.reserved) {
                this.saveQueue(result.reserved);
            }
        });
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
            callback(new Item(itemId, this.getCount(itemId)));
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
