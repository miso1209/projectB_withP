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

    getPartyIndex() {
        const result = [];

        for (let i=0;i<=PARTY_SIZE;i++) {
            if (this.members[i]) {
                result.push(this.members[i].id);
            } else {
                result.push(0);
            }
        }

        return result;
    }

    membersCount() {
        let result = 0;

        for (let i=0; i<PARTY_SIZE;i++) {
            if(this.members[i]) {
                result++;
            }
        }

        return result;
    }

    enterMemberAnyPlace(character) {
        for (let i=0; i<PARTY_SIZE;i++) {
            if(!this.members[i]) {
                this.set(i, character);
                break;
            }
        }
    }

    set(index, character) {
        const copyMembers = [].concat(this.members);
        const characterIndex = copyMembers.indexOf(character);

        if (characterIndex >= 0) {
            copyMembers[characterIndex] = null;
            copyMembers[index] = character;
        } else {
            copyMembers[index] = character;
        }
        // --------------------------------------------------------
        let partyHeath = 0;
        copyMembers.forEach((member) => {
            if (member) {
                partyHeath += member.health;
            }
        });

        if (partyHeath > 0) {
            this.members = copyMembers;
        }
    }

    getBattleAllies() {
        const allies = [];

        // 임시로 좌표 임의설정.
        this.members.forEach((member, i) => {
            if(member && member.health > 0) {
                allies.push({
                    character: member,
                    x: i % 3,
                    y: Math.floor(i / 3)
                });
            }
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