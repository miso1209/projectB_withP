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
}