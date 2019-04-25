import Item from './item';

export default class ItemFactory {
    constructor() {
        this.load();
    }

    load() {
        // 아이템 데이터를 로딩한다
        this.items = {}

        // 아이템정보를 선언한다
        this.items[1] = {
            id: 1,
            name: "기본검",
            image: "item1.png",
            attack: 10,
            description: "흔히 볼 수 있는 평범한 무기"
        };

        this.items[2] = {
            id: 2,
            name: "기본갑옷",
            image: "item2.png",
            defense: 5,
            description: "흔히 볼 수 있는 평범한 갑옷"
        };
    }

    // 아이템 객체를 생성해서 반환한다
    item(itemId) {
        const data = this.items[itemId];
        if (data) {
            // 여기서 아이템 정보를 찾아서 인스턴스 객체를  만들어야 하지만, 일단은 아이템 정보가 따로 없으므로 패스
            return new Item(data);
        }
    }
}