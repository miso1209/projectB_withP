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
        this.data.quests = {};
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
    
    addTag(tag) {
        if (this.data.tags.indexOf(tag) < 0) {
            this.data.tags.push(tag);
            this.save();
        }
    }

    setQuest(questId, questData) {
        this.data.quests[questId] = questData;
        this.save();
    }

    addItem(itemId, count) {
        this.data.inventory[itemId] = count;
        this.save();
    }

    updateItem(itemId, count) {
        this.data.inventory[itemId] += count;
        this.save();
    }

    removeItem(itemId) {
        delete this.data.inventory[itemId];
        this.save();
    }
}