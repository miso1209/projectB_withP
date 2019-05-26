export default class Storage {
    constructor() {
        if (localStorage.data) {
            this.data = JSON.parse(localStorage.data);
            console.log("load data", this.data);
        } else {
            this.data = null;
        }
    }

    resetData() {
        this.data = {};
        this.data.characters = {};
        this.data.party = [0, 0, 0, 0, 0, 0]; // 파티최대 숫자를 어딘가에?
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
        return this.data.alreadyPlayed;
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

    completeQuest(questId) {
        delete this.data.quests[questId];
        this.save();
    }

    updateInventory(data) {
        this.data.inventory = data;
        this.save();
    }

    updateCharacter(data) {
        console.log(this.data);
        this.data.characters[data.id] = data;
        this.save();
    }
}