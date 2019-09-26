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
            if (result) {
                if (result.added) {
                    for (const itemId in result.added) {
                        if (!this.itemListMap[itemId]) {
                            this.itemListMap[itemId] = [];
                        }
                        result.added[itemId].forEach(asset => this.itemListMap[itemId].push(asset));
                    }
                    console.log(`\tresult.added:${JSON.stringify(result.added)}`);
                }
                if (result.deleted) {
                    for (const itemId in result.deleted) {
                        this.itemListMap[itemId] = 
                        this.itemListMap[itemId].filter(assetId => !result.deleted[itemId].includes(assetId));
                    }
                    console.log(`\tresult.deleted:${JSON.stringify(result.deleted)}`);
                }
                console.log(`\tafter:${JSON.stringify(this.itemListMap)}`);
                if (result.reserved) {
                    console.log(`\tresult.reserved:${JSON.stringify(result.reserved)}`)
                    this.saveQueue(result.reserved);
                }
            } else {
                console.log('\twait before save through network..');
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
