export default class ItemTable {
    constructor() {
    }

    init(data) {
        this.data = data;
    }

    getCategory(itemId) {
        const item = this.data[itemId];
        if (!item)  {
            return Error("invalid item id:" + itemId);
        }
        return item.category;
    }

}