import Item from './item';
import CharacterBase from './characterbase';

export default class EntityFactory {
    constructor() {
        this.items = {}
        this.characters = {}
    }

    setItems(items) {
        this.items = items;
    }

    setCharacters(characters) {
        this.characters = characters;
    }

    // 아이템 객체를 생성해서 반환한다
    item(itemId) {
        const data = this.items[itemId];
        if (data) {
            // 여기서 아이템 정보를 찾아서 인스턴스 객체를  만들어야 하지만, 일단은 아이템 정보가 따로 없으므로 패스
            return new Item(data);
        }
    }

    character(id) {
        const data = this.characters[id];
        if (data) {
            return new CharacterBase(data);
        }
    }
}