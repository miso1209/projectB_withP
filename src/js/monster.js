import Character from "./character";

export default class Monster {
    constructor(origin) {
        this.origin = origin;
    }

    get fieldCharacter() {
        return this.origin.field;
    }

    get totalPowerFigure() {
        let result = 0;

        this.battleCharacters.forEach((c) => {
            if (c.id !== 0) {
                const character = new Character(c.id, c.rank);
                character.level = c.level;
    
                result += character.totalPowerFigure;
            }
        });

        return result;
    }

    get battleCharacters() {
        return this.origin.battle.characters;
    }

    get exp() {
        return this.origin.exp;
    }

    get gold() {
        return this.origin.gold;
    }

    get rewards() {
        return this.origin.rewards;
    }

    get name() {
        return this.origin.name;
    }

    columnOf(i) {
        return i % 3;
    }

    rowOf(i) {
        return Math.floor(i / 3);
    }
}