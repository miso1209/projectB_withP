import { EventEmitter } from "events";

export default class Storage extends EventEmitter {
    constructor() {
        super();
        this.VERSION = 0.2;

        if (localStorage.data) {
            this.data = JSON.parse(localStorage.data);
            if (this.data.version !== this.VERSION) {
                // 변환할 방법을 찾아야 한다.
                this.data = this.convertVersion(this.data);
            }
            
        } else {
            this.data = null;
        }
    }

    resetData() {
        this.data = {};
        this.data.version = this.VERSION;
        this.data.characters = {};
        this.data.party = [0, 0, 0, 0, 0, 0]; // 파티최대 숫자를 어딘가에?
        this.data.inventory = {};
        this.data.gold = 0;
        this.data.tags = [];
        this.data.quests = {};
    }

    convertVersion(src) {
        // TODO 나중에 버전 체인을 하도록 한다.
        this.resetData();
        return this.data;
    }

    save() {
        localStorage.data = JSON.stringify(this.data);
        this.emit('save');
    }

    clear() {
        localStorage.data = "";
        this.resetData();
    }

    addTag(tag) {
        if (this.data.tags.indexOf(tag) < 0) {
            this.data.tags.push(tag);
            this.save();
        }
    }

    setControlCharacter(id) {
        this.data.controlCharacter = id;
        this.save();
    }

    saveParty(party) {
        this.data.party = party;
        this.save();
    }

    getLocation() {
        return this.data.location;
    }

    saveLocation(stagePath, eventName) {
        this.data.location = {
            stagePath: stagePath,
            eventName: eventName
        };
        this.save();
    }

    addCharacter(id, character) {
        if (!this.data.characters[id]) {
            this.data.characters[id] = character;
        }
        this.save();
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
        this.data.inventory = data.inventory;
        this.data.gold = data.gold;
        this.save();
    }

    updateCharacter(data) {
        this.data.characters[data.id] = data;
        this.save();
    }
}