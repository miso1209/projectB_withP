// 이 클래스에서는 캐릭터의 보여지는 부분은 표현하지 않는다
// 위치나 현재 애니메이션 상태등도 처리하지 않는다
// 캐릭터의 스탯과 장비에 대한 부분만 처리한다 
export default class Character {
    constructor(data) {

        this.data = data;
        
        this.health;
        
        this.baseMaxHealth;
        this.plusMaxHealth = 0;

        this.baseStrength = 0;//data.getStrength(level);
        this.plusStrength = 0;

        this.baseIntellect;
        this.plusIntellect = 0;

        this.baseAgility;
        this.plusAgility = 0;

        this.baseStamina;
        this.plusStamina = 0;

        this.baseSpeed;
        this.plusSpeed = 0;

        this.baseCritical;
        this.plusCritical = 0;

        this.baseRegist;
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
    }

    get name() {
        return this.data.name;
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
        return Math.floor(this.strength * this.attackPotential) + this.attackPower;
    }

    get magic() {
        return Math.floor(this.intellect * this.magicPotential) + this.plusMagic;
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
            option.apply(this);
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
                option.clear(this);
            }
        }
    }
    
}
