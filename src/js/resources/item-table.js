class ItemOption {
    constructor(option) {
        this.src = option;
        // 옵션을 함수와 인자로 분리한다
        const re = /(\w+)\s*\((.*)\)\s*/g;
        const array = re.exec(option);
        
        this.name = array[1];
        this.args = array[2].split(/\s*\,\s*/);
    }

    apply(target) {
        switch(this.name) {
            case "attack":
                target.plusAttack += Number(this.args[0]);
                break;
            case "matic":
                target.plusMagic += Number(this.args[0]);
                break;
            case "armor":
                target.plusArmomr += Number(this.args[0]);
                break;
            case "health":
                target.health += Number(this.args[0]);
                target.health = Math.min(target.maxHealth, target.health);
                break;
        }
    }

    clear(target) {
        switch(this.name) {
            case "attack":
                target.plusAttack -= Number(this.args[0]);
                break;
            case "matic":
                target.plusMagic -= Number(this.args[0]);
                break;
            case "armor":
                target.plusArmomr -= Number(this.args[0]);
                break;
            case "health":
                target.health -= Number(this.args[0]);
                target.health = Math.max(0, target.health);
                break;
        }
    }

    toString() {
        switch(this.name) {
            case "attack":
                return "공격 " + this.args[0];
            case "matic":
                return "마법 " + this.args[0];
            case "armor":
                return "방어 " + this.args[0];
            case "health":
                return "체력회복 " + this.args[0];
        }
    }
}

export default class ItemTable {
    constructor() {
    }

    init(data) {
        this.data = data;
        // 아이템 옵션을 적용한다
        // 아이템 옵션은 적용(apply)과 해제(clear) 가 있다..
        // 착용 아이템일 경우는 착용과 동시에 적용이 일어나고 해제할때 해제가 발생한다
        // 사용아이템은 사용할때 적용이 발생하고 해제는 따로 발생하지 않는다
        for (const itemId in  this.data) {
            const item = this.data[itemId];
            const newOptions = [];
            if (item.options) {
                for (const option of item.options) {
                    const itemOption = new ItemOption(option);
                    newOptions.push(itemOption);
                }
            }
            item.options = newOptions;
        }
    }

    getCategory(itemId) {
        const item = this.data[itemId];
        if (!item)  {
            return Error("invalid item id:" + itemId);
        }
        return item.category;
    }

    getData(itemId) {
        return this.data[itemId];
    }
}