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
                target.plusArmor += Number(this.args[0]);
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
                target.plusArmor -= Number(this.args[0]);
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

const items = require('json/items.json');
for (const itemId in  items) {
    const item = items[itemId];
    const newOptions = [];
    if (item.options) {
        for (const option of item.options) {
            const itemOption = new ItemOption(option);
            newOptions.push(itemOption);
        }
    }
    item.options = newOptions;
}

export default class ItemTable {


    getCategory(itemId) {
        const item = items[itemId];
        if (!item)  {
            return Error("invalid item id:" + itemId);
        }
        return item.category;
    }

    getData(itemId) {
        return items[itemId];
    }
}