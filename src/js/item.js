import items from './items';

export default class Item {
    constructor(id, count) {
        this.data = items[id];
        if (!this.data) {
            console.log('wrong data');
        }
        
        this.id = id;
        this.count = count || 1; // count 지정되지 않았다면, 1 로 설정한다
    }

    get name() {
        return this.data.name;
    }

    get rank() {
        return this.data.rank;
    }

    get category() {
        return this.data.category;
    }

    get description() {
        return this.data.description;
    }

    get classes() {
        return this.data.classes;
    }

    get owned() {
        return this.count;
    }

    get options() {
        return this.data.options;
    }
}