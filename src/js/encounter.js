const encounters = require("json/encounters.json");

export default class Encounter {
    constructor(stage) {
        const list = encounters[stage] || [];
        let maxFreq = 0;
        for(const li of list) {
            maxFreq += li.frequency;
        }

        // 프리퀀시 랜덤 선택을 한다
        let selected = Math.random() * maxFreq;
        for(const li of list) {
            selected -= li.frequency;
            if (selected <= 0) {
                // 선택되었다.
                this.data = li;
                break;
            }
        }
    }

    get exp() {
        return this.data.exp;
    }

    get monsters() {
        return this.data.monsters;
    }

    get rewards() {
        return this.data.rewards;
    }

    columnOf(i) {
        return i % 3;
    }

    rowOf(i) {
        return Math.floor(i / 3);
    }
}