

export default class Inventory {
    constructor() {
        this.items = [];
    }

    addItem(item) {
        //const item = new Item(itemId, itemType);
        this.items.push(item);
    }

    getItemByType(itemType) {
        for(const item of this.items) {
            if (item.itemType === itemType) {
                return item;
            }
        }
        return null;
    }

    deleteItem(itemId) {
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (item.itemId === itemId) {
                this.items.splice(i, 1);
                return;
            }
        }
    }

    eachItem(callback) {
        for(const item of this.items) {
            callback(item);
        }
    }
}
