

export default class Inventory {
    constructor(itemResources) {
        this.items = {};
        this.itemResources = itemResources;
    }

    addItem(itemId, count) {
        count = count || 1;
        this.items[itemId] = {
            id: itemId,
            data: this.itemResources.getData(itemId),
            count: count
        };
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
    }

    getCount(itemId) {
        const item = this.items[itemId];
        if (item) {
            return item.count;
        } else {
            return 0;
        }
    }
}
