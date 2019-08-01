import { EventEmitter } from "events";

export default class Storage extends EventEmitter {
    constructor() {
        super();
        this.VERSION = 0.2;
        this.LAST_DATE = new Date();

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
        this.data.playTime = 0;
        this.data.tags = [];
        this.data.location = {};
        this.data.settings = {
            sound: {
                volume: {
                    Master: 0,
                    BGM: 1,
                    Default: 1
                }
            }
        };
        this.data.checkedQuest = [];
        this.data.selectableFloor = [1];
        this.data.selectableList = [0, 1];
        this.data.cutscene = null;
        this.data.created = new Date();
        this.data.refreshSelectableDate = new Date();
        this.data.quests = {};
        this.data.completedQuests = {};
    }

    addSelectableFloor(floor) {
        if (this.data.selectableFloor.indexOf(floor) < 0 && floor > 0) {
            this.data.selectableFloor.push(floor);
            
            // selectableList 갱신.
            this.refreshSelectableFloorList();
        }

        return this.data.selectableFloor;
    }

    convertVersion(src) {
        // TODO 나중에 버전 체인을 하도록 한다.
        this.resetData();
        return this.data;
    }

    save() {
        this.updatePlayTime();
        localStorage.data = JSON.stringify(this.data);
        this.emit('save');
    }

    clear() {
        localStorage.data = "";
        this.resetData();
    }

    setVolume(type, volume) {
        this.data.settings.sound.volume[type] = volume;
        this.save();
    }

    updatePlayTime() {
        const NEW_DATE = new Date();
        this.data.playTime += NEW_DATE - this.LAST_DATE;
        this.LAST_DATE = NEW_DATE;
    }

    addTag(tag) {
        if (this.data.tags.indexOf(tag) < 0) {
            this.data.tags.push(tag);
            this.save();
        }
    }

    refreshSelectableFloorList() {
        const list = [].concat(this.data.selectableFloor);
        while(list.length > 4) {
            const rand = Math.round(Math.random() * (list.length - 1));
            list.splice(rand, 1);
        }

        list.sort((a, b) => {
            return a>b?1:-1
        });

        this.data.selectableList = [0].concat(list);
        this.refreshSelectableFloorDate();
    }

    refreshSelectableFloorDate() {
        this.data.refreshSelectableDate = new Date();
        this.save();
    }

    setControlCharacter(id) {
        this.data.controlCharacter = Number(id);
        this.save();
    }

    saveParty(party) {
        party = party.map((character) => {
            return Number(character)
        });
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
            this.save();
        }
    }

    checkQuest(questId, bool) {
        const index = this.data.checkedQuest.indexOf(Number(questId));
        if (index >= 0 && bool) {
            this.data.checkedQuest.splice(this.data.checkedQuest.indexOf(Number(questId)), 1);
        } else if (index < 0 && !bool) {
            this.data.checkedQuest.push(Number(questId));
        }
        
        this.save();
    }

    setQuest(questId, data) {
        if (!this.data.quests[questId]) {
            this.data.quests[questId] = Object.assign({
                beginDate : new Date().toString()
            }, data);
            this.save();
        } else {
            this.data.quests[questId] = Object.assign(this.data.quests[questId],data);
            this.save();
        }
    }

    completeQuest(questId) {
        if (this.data.quests[questId]) {
            this.data.completedQuests[questId] = Object.assign({
                clearDate : new Date().toString()
            }, this.data.quests[questId]);
            delete this.data.quests[questId];
            this.save();

            return this.data.completedQuests[questId];
        }
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