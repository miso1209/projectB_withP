import Inventory from './inventory';
import Party from './party';
import Character from './character';

// 플레이어랑 필드캐릭터랑 나중에 분리해야 한다 
// 왜냐하면  필드캐릭터는 계속 변경이 될수 있는데, 플레이어는 안바뀌니까 ...

export default class Player {
    constructor() {
        // 보유하고 있는 아이템 목록
        this.inventory = new Inventory();
        // 자신이 가지고 있는 캐릭터 목록
        this.characters = {};
        // 파티 클래스를 만들어서 처리를 한다
        this.party = new Party();         
        
        this.quests = {};
        // 대표 캐릭터 자신이 가지고 있는 캐릭터 중에 하나를 골라서 필드 캐리터로 사용한다
        this.controlCharacter = null;
        
        // 태그정보
        this.tags = [];
    }

    // 임시 설정.
    addCharacter(id) {
        this.characters[id] = new Character(id);
    }

    addTag(tag) {
        if (this.tags.indexOf(tag) < 0) {
            this.tags.push(tag);
        }
    }

    setControlCharacter(id) {
        this.controlCharacter = id;
    }

    hasTag(tag) {
        return this.tags.indexOf(tag) >= 0;
    }
}