import { DstAlphaFactor } from "three";

export default class Storage {
    constructor() {
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
        this.data.characters[data.id] = data;
        this.save();
    }
}