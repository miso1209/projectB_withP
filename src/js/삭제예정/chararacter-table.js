
class CharacterData {
    constructor(id, src) {
        this.id = id;

        Object.assign(this, src);
    }

    getStat(stat, level) {
        if (level < 1) {
            throw Error('invalid level: ' + level)
        }

        // base 가 level 1 일때의 상태이다
        const delta = level - 1;
        return (this.base[stat] || 0) + delta * (this.levelup[stat] || 0)
    }
}

export default class CharacterTable {
    constructor() {
        this.data = {};
    }

    init(data) {
        for(const cId in data) {
            this.data[cId] = new CharacterData(cId, data[cId]);
        }
    }

    getData(id) {
        return this.data[id];
    }
}