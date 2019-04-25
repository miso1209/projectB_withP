// 이 클래스에서는 캐릭터의 보여지는 부분은 표현하지 않는다
// 위치나 현재 애니메이션 상태등도 처리하지 않는다
// 캐릭터의 스탯과 장비에 대한 부분만 처리한다 
export default class CharacterBase {
    constructor(data) {
        
        this.health;
        
        this.baseMaxHealth;
        this.plusMaxHealth = 0;

        this.baseStrength;
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

        this.plusPower = 0;
        this.plusMagic = 0;
        this.plusArmomr = 0;

        this.powerPotential = 0.5;
        this.magicPotential = 0.5;
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

    get power() {
        return Math.floor(this.strength * this.powerPotential) + this.plusPower;
    }

    get magic() {
        return Math.floor(this.intellect * this.magicPotential) + this.plusMagic;
    }

    equip(slot, item) {
        this.equipments[slot] = item;
        
        this.plusPower += item.power;
        this.plusMagic += item.magic;
        // 기타 필요에 따라 추가
    }

    unequip(slot) {
        const item = this.equipments[slot];
        this.equipments[slot] = null;
        
        this.plusPower -= item.power;
        this.plusMagic -= item.magic;
    }
    
}
