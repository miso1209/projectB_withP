export default class Storage {
    constructor() {
        if (localStorage.data) {
            this.data = JSON.parse(localStorage.data);
            console.log("load data", this.data);
        } else {
            this.resetData();
        }
    }

    resetData() {
        this.data = {};
        this.data.inventory = {};
        this.data.tags = [];
    }

    save() {
        localStorage.data = JSON.stringify(this.data);
    }

    clear() {
        localStorage.data = "";
        this.resetData();
    }

    hasAlreadyPlayed() {
        return this.data.player ? true : false;
    }
    
    addItem(itemId, count) {
        this.data.inventory[itemId] = (this.data.inventory[itemId] || 0 ) + count;
        if (this.data.inventory[itemId] <= 0) {
            delete this.data.inventory[itemId];
        }
        this.save();
    }

    addTag(tag) {
        if (this.data.tags.indexOf(tag) < 0) {
            this.data.tags.push(tag);
            this.save();
        }
    }
}