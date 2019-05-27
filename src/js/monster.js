import monsters from "./monsters";

export default class Monster {
    static GetByStage(stageName) {
        const result = [];
        // 정의 되어 있지 않은 데이터는  undefined  반환하는데, 이것을 빈 배열로 바꾸어준다
        const list = monsters[stageName] || [];
        for(const item of list) {
            result.push(new Monster(item));
        }
        return result;
    }

    constructor(origin) {
        this.origin = origin;
    }

    get fieldCharacter() {
        return this.origin.field;
    }

    get battleCharacters() {
        return this.origin.battle.characters;
    }

    get exp() {
        return this.origin.exp;
    }

    get rewards() {
        return this.origin.rewards;
    }

    columnOf(i) {
        return i % 3;
    }

    rowOf(i) {
        return Math.floor(i / 3);
    }
}