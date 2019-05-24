import characters from './characters';
import ScriptParser from './scriptparser';

// 이 클래스에서는 캐릭터의 보여지는 부분은 표현하지 않는다
// 위치나 현재 애니메이션 상태등도 처리하지 않는다
// 캐릭터의 스탯과 장비에 대한 부분만 처리한다 
export default class Character {
    constructor(id) {
        this.id = id;
        this.level = 1;
        const data = characters[id];
        this.data = data;
        
       
        this.plusMaxHealth = 0;
        this.health = this.maxHealth;

        this.plusStrength = 0;
        this.plusIntellect = 0;
        this.plusAgility = 0;
        this.plusStamina = 0;
        this.plusSpeed = 0;
        this.plusCritical = 0;
        this.plusRegist = 0;

        this.equipments = {
            weapon: null,
            amomr: null,
            accessory: null,
        };

        this.plusAttack = 0;
        this.plusMagic = 0;
        this.plusArmor = 0;

        this.attackPotential = 0.5;
        this.magicPotential = 0.5;
        this.armorPotential = 0.5;

        this.skills = data.skills;
    }

    getParam(parameterName, level) {
        if (level < 1) {
            throw Error('invalid level: ' + level)
        }

        // base 가 level 1 일때의 상태이다
        const delta = level - 1;
        return (this.data.base[parameterName] || 0) + delta * (this.data.levelup[parameterName] || 0)
    }

    get name() {
        return this.data.name;
    }

    get baseMaxHealth() {
        return this.getParam('health', this.level);
    }
    
    get baseStrength() {
        return this.getParam('strength', this.level);
    }
    
    get baseIntellect() {
        return this.getParam('intellect', this.level);
    }
    
    get baseAgility() {
        return this.getParam('agility', this.level);
    }

    get baseStamina() {
        return this.getParam('stamina', this.level);
    }

    get baseSpeed() {
        return this.getParam('speed', this.level);
    }
    
    get baseCritical() {
        return this.getParam('critical', this.level);
    }

    get baseRegist() {
        return this.getParam('regist', this.level);
    }

    get maxHealth() {
        return this.baseMaxHealth + this.plusMaxHealth;
    }

    get strength() {
        return this.baseStrength + this.plusStrength;
    }

    get intellect() {
        return this.baseIntellect + this.plusIntellect;
    }

    get stamina() {
        return this.baseStamina + this.plusStamina;
    }

    get attack() {
        return Math.floor(this.strength * this.attackPotential * 10) + this.plusAttack;
    }

    get magic() {
        return Math.floor(this.intellect * this.magicPotential * 10) + this.plusMagic;
    }

    get armor() {
        return Math.floor(this.stamina * this.armorPotential) + this.plusArmor;
    }

    equip(slot, item) {
        if (!this.canEquip(slot, item)) {
            throw Error("can not equip item :" + item.name + " at " +  slot);
        }

        // 기존에 사용하고 있던 아이템이 있으면 제거한다
        if (this.equipments[slot]) {
            this.unequip(slot);
        }

        this.equipments[slot] = item;
        // 아이템 옵션을 적용한다
        for(const option of item.options) {
            this.applyOption(option);
        }
    }

    canEquip(slot, item) {
        // 아이템 카테고리가 일치하는지 보고, 서브 카테고리가 일치하는지도 살펴본다.
        // TODO : 서브 카테고리는 나중에 처리
        return item.category === slot;
    }

    unequip(slot) {
        const item = this.equipments[slot];
        if (item) {
            this.equipments[slot] = null;
            // 아이템 옵션을 적용한다
            for(const option of item.options) {
                this.clearOption(option);
            }
        }
    }

    applyOption(option) {
        // TODO : 매번 옵션을 파싱하지 않고 미리 캐싱해놓을필요가 있다
        option = new ScriptParser(option);
        switch(option.name) {
            case "attack":
                this.plusAttack += Number(option.args[0]);
                break;
            case "matic":
                this.plusMagic += Number(option.args[0]);
                break;
            case "armor":
                this.plusArmor += Number(option.args[0]);
                break;
            case "health":
                this.health += Number(option.args[0]);
                this.health = Math.min(this.maxHealth, this.health);
                break;
            case "maxHealth":
                this.plusMaxHealth += Number(option.args[0]);
                this.health = Math.min(this.maxHealth, this.health);
                break;
        }
    }

    clearOption(option) {
        option =new ScriptParser(option);
        switch(option.name) {
            case "attack":
                this.plusAttack -= Number(option.args[0]);
                break;
            case "matic":
                this.plusMagic -= Number(option.args[0]);
                break;
            case "armor":
                this.plusArmor -= Number(option.args[0]);
                break;
            case "health":
                break;
            case "maxHealth":
                this.plusMaxHealth -= Number(option.args[0]);
                this.health = Math.max(0, this.health);
                break;
        }
    }
}
