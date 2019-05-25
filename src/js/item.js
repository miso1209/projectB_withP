import items from './items';

export default class Item {
    constructor(id, count) {
        this.data = items[id];
        if (!this.data) {
            console.log('additem',id, count);
        }
        
        this.id = id;
        this.count = count || 1; // count 지정되지 않았다면, 1 로 설정한다
    }

    get name() {
        return this.data.name;
    }

    get category() {
        return this.data.category;
    }

    get description() {
        return this.data.description;
    }

    get options() {
        return this.data.options;
    }
}