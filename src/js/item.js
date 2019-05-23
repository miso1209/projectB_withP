import items from './items';

export default class Item {
    constructor(id, count) {
        this.data = items[id];
        
        this.id = id;
        this.count = count || 1; // count 지정되지 않았다면, 1 로 설정한다
    }

    get category() {
        return this.data.category;
    }
}