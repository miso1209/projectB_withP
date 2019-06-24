import Character from './character';

const PARTY_SIZE = 6;

export default class Party {
    constructor() {
        this.members = new Array(PARTY_SIZE);
        this.rollbackMembers = new Array(PARTY_SIZE);
    }

    cancel() {
        for (let i=0; i<PARTY_SIZE;i++) {
            this.members[i] = this.rollbackMembers[i];
        }
    }

    confirm() {
        for (let i=0; i<PARTY_SIZE;i++) {
            this.rollbackMembers[i] = this.members[i];
        }
    }

    set(index, character) {
        const characterIndex = this.members.indexOf(character);
        if (characterIndex>=0) {
            this.members[characterIndex] = null;
            this.members[index] = character;
        } else {
            this.members[index] = character;
        }
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