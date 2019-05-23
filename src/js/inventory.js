import Item from "./item";
import { EventEmitter } from "events";


export default class Inventory extends EventEmitter{
    constructor() {
        super();
        this.items = {};
    }

    addItem(itemId, count) {
        count = count || 1;
        const item = this.items[itemId];
        if (item) {
            item.count += count;
            this.emit('chagned', itemId, count);
        } else {
            this.items[itemId] = new Item(itemId, count);
            this.emit('added', itemId, count);
        }
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
            this.emit('removed', itemId);
        } else {
            this.emit('chagned', itemId, -count);
        }
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
}
