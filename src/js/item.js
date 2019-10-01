import items from './items';
import {ConvertRankToItemIdBase} from './utils';

export default class Item {
    constructor(id, count, assetId) {
        if (/^\D/.test(id)) {
            const stringItemId = String(id);
            const rank = stringItemId.substring(0, 1);
            id = Number(stringItemId.substring(1)) + ConvertRankToItemIdBase(rank);
        }
        this.data = items[id];
        if (!this.data) {
            console.error('wrong data', id);
        }
        
        this.id = id;
        this.count = count || 1; // count 지정되지 않았다면, 1 로 설정한다
        this.assetId = assetId;
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