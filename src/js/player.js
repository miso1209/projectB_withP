import FieldCharacter from './fieldcharacter';
import Inventory from './inventory';

// 플레이어랑 필드캐릭터랑 나중에 분리해야 한다 
// 왜냐하면  필드캐릭터는 계속 변경이 될수 있는데, 플레이어는 안바뀌니까 ...

export default class Player extends FieldCharacter {
    constructor(spec) {
        super(spec);

        this.inventory = new Inventory();
    }
}