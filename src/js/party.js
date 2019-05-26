import Character from './character';

const PARTY_SIZE = 6;

export default class Party {
    constructor() {
        this.members = new Array(PARTY_SIZE);
    }

    set(index, character) {
        this.members[index] = character;
    }

    getBattleAllies() {
        return [{ character: new Character(1), x: 0, y: 0},
            { character: new Character(2), x: 1, y: 0},
            { character: new Character(3), x: 0, y: 1},
            { character: new Character(4), x: 1, y: 1}];
    }
}