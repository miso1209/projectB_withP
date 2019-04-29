export default class BattleParty {
    constructor(frontCharacters, backCharacters) {
        this.front = [].concat(frontCharacters);
        this.back = [].concat(backCharacters);
    }

    // 기본적으로 위치를 차지하게 하기위해 front 나 back 중간에 null이 들어있는데.. 이 값을 없애고 넘겨줘서 반복문 쉽게돌리기 위해 만들어진 함수들..
    getCharacters() {
        let characters = [];

        this.front.concat(this.back).forEach((character) => {
            if (character !== null) {
                characters.push(character);
            }
        });

        return characters;
    }

    getFrontCharacters() {
        let characters = [];

        this.front.forEach((character) => {
            if (character !== null) {
                characters.push(character);
            }
        });

        return characters;
    }

    getBackCharacters() {
        let characters = [];

        this.back.forEach((character) => {
            if (character !== null) {
                characters.push(character);
            }
        });

        return characters;
    }
    
    isParty(character) {
        let result = false;
        this.getCharacters().forEach((compareCharacter) => {
            if (compareCharacter === character) {
                result = true;
            }
        });

        return result;
    }
}