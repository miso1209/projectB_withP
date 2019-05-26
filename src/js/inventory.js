import Item from "./item";

export default class Inventory {
    constructor() {
        this.items = {};
        this.dirty = false;
    }

    addItem(itemId, count) {
        count = count || 1;
        const item = this.items[itemId];
        if (item) {
            item.count += count;
        } else {
            this.items[itemId] = new Item(itemId, count);
        }

        this.makeDirty();
    }

    deleteItem(itemId, count) {
        // count 가 없으면 기본으로 1을 준다
        count = count || 1;

        const item = this.items[itemId];
        if (item.count < count) {
            throw Error("not enough owned items");
        }

        item.count -= count;
        if (item.count === 0) {
            delete this.items[itemId];
        }

        this.makeDirty();
    }

    getCount(itemId) {
        const item = this.items[itemId];
        if (item) {
            return item.count;
        } else {
            return 0;
        }
    }

    getItem(itemId) {
        return this.items[itemId];
    }

    forEach(callback) {
        for(const itemId in this.items) {
            callback(this.items[itemId]);
        }
    }
    
    load(data) {
        for (const itemId in data) {
            this.addItem(itemId, data[itemId]);
        }
        this.clearDirty();
    }

    save() {
        const result = {};
        for (const itemId in this.items) {
            result[itemId] = this.items[itemId].count;
        }
        return result;
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
