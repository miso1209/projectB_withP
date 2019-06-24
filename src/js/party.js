import Character from './character';

const PARTY_SIZE = 6;

export default class Party {
    constructor() {
        this.members = new Array(PARTY_SIZE);
    }

    set(index, character) {
        this.members[index] = character;
        console.log(this);
    }

    getBattleAllies() {
        const allies = [];

        // 임시로 좌표 임의설정.
        this.members.forEach((member, i) => {
            allies.push({
                character: member,
                x: i % 3,
                y: Math.floor(i / 3)
            });
        });

        return allies;
    }

    get totalPowerFigure() {
        let result = 0;

        this.members.forEach((character) => {
            if (character) {
                result += character.totalPowerFigure;
            }
        });

        return result;
    }
}