import Inventory from './inventory';

// 플레이어랑 필드캐릭터랑 나중에 분리해야 한다 
// 왜냐하면  필드캐릭터는 계속 변경이 될수 있는데, 플레이어는 안바뀌니까 ...

export default class Player {
    constructor() {
        // 보유하고 있는 아이템 목록
        this.inventory = new Inventory();
        // 자신이 가지고 있는 캐릭터 목록
        this.characters = [];
        // 대표 캐릭터 자신이 가지고 있는 캐릭터 중에 하나를 골라서 필드 캐리터로 사용한다
        // 캐릭터 로딩을 언제 어떻게 해야할까... 게임 시작시에 미리 데이터를 로딩해야 할 것 같다. 
        // 캐릭터 팩토리를 다시 만들어야 할듯
        this.controlCharacter = null;
        this.quests = {};
    }

    addTag(tag) {
        if (this.tags.indexOf(tag) < 0) {
            this.tags.push(tag);
        }
    }

    hasTag(tag) {
        return this.tags.indexOf(tag) >= 0;
    }
}