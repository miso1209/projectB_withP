import characters from './characters';
import ScriptParser from './scriptparser';
import Item from './item';
import Skill from "./skill";

// 이 클래스에서는 캐릭터의 보여지는 부분은 표현하지 않는다
// 위치나 현재 애니메이션 상태등도 처리하지 않는다
// 캐릭터의 스탯과 장비에 대한 부분만 처리한다 

export default class Character {
    constructor(id) {
        this.id = id;
        this.level = 1;
        this.exp = 0;
        
        const data = characters[id];
        this.data = data;

        this.plusMaxHealth = 0;
        this.plusStrength = 0;
        this.plusIntellect = 0;
        this.plusAgility = 0;
        this.plusStamina = 0;
        this.plusSpeed = 0;
        this.plusCritical = 0;
        this.plusAttack = 0;
        this.plusMagic = 0;
        this.plusArmor = 0;

        this.equipments = {
            weapon: null,
            armor: null,
            accessory: null,
        };

        this.simulatedMaxHealth = 0;
        this.simulatedStrength = 0;
        this.simulatedIntellect = 0;
        this.simulatedAgility = 0;
        this.simulatedStamina = 0;
        this.simulatedSpeed = 0;
        this.simulatedCritical = 0;
        this.simulatedAttack = 0;
        this.simulatedMagic = 0;
        this.simulatedArmor = 0;

        this.simulationEquipments = {
            weapon: null,
            armor: null,
            accessory: null,
        };

        this.attackPotential = 0.5;
        this.magicPotential = 0.5;
        this.armorPotential = 0.5;

        this.skills = data.skills;
        
        this.health = this.maxHealth;

        this.dirty = false;
    }

    getParam(parameterName, level) {
        if (level < 1) {
            throw Error('invalid level: ' + level)
        }

        // base 가 level 1 일때의 상태이다
        const delta = level - 1;
        return (this.data.base[parameterName] || 0) + delta * (this.data.levelup[parameterName] || 0)
    }

    get displayName() {
        return this.data.displayname;
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

    get maxHealth() {
        // 소숫점의 체력은 버린다.
        const maxHealth = this.simulatedMaxHealth?this.simulatedMaxHealth:this.plusMaxHealth;
        return Math.floor(this.baseMaxHealth + maxHealth);
    }

    get strength() {
        const strength = this.simulatedStrength?this.simulatedStrength:this.plusStrength;
        return this.baseStrength + strength;
    }

    // 민첩은 크리티컬 데미지에 사용한다. 100 Agility에 100% 추가데미지.
    get agility() {
        const agility = this.simulatedAgility?this.simulatedAgility:this.plusAgility;
        return this.baseAgility + agility;
    }

    get intellect() {
        const intellect = this.simulatedIntellect?this.simulatedIntellect:this.plusIntellect;
        return this.baseIntellect + intellect;
    }

    get stamina() {
        const stamina = this.simulatedStamina?this.simulatedStamina:this.plusStamina;
        return this.baseStamina + stamina;
    }

    get critical() {
        const critical = this.simulatedCritical?this.simulatedCritical:this.plusCritical;
        return (this.baseCritical + critical)>=1?1:(this.baseCritical + critical);
    }

    // 기본적인 크리티컬 데미지는 1.2배로 한다.
    get criticalPotential() {
        return 1.2 + (this.agility / 100)
    }

    // 총체적 공격력을 구해보자.. 공식에 신빙성이 있어야 하는데.. 체력과 공격력에 비례한 어떠한 수치 이지만, 완벽한 강함의 척도는 아니다.
    get totalPowerFigure() {
        return Math.round(Math.sqrt(this.strongFigure * this.armorFigure));
    }

    get strongFigure() {
        // 기본적인 기대 데미지
        const basicDmg = (this.attack>this.magic?this.attack:this.magic) * this.speed;
        const nonCriticalDmg = basicDmg * (1 - this.critical);
        const criticalDmg = (basicDmg * this.criticalPotential) * this.critical;

        // 공격 기대 수치.
        const resultDmg = nonCriticalDmg + criticalDmg;

        return Math.round(resultDmg);
    }

    get armorFigure() {
        // 방어 기대 수치
        const resultDefense = this.maxHealth + this.armor;

        return Math.round(resultDefense);
    }

    get attack() {
        const attack = this.simulatedAttack?this.simulatedAttack:this.plusAttack;
        return Math.floor(this.strength * this.attackPotential * 10) + Math.floor(this.agility * this.attackPotential * 2) + (attack);
    }

    get magic() {
        const magic = this.simulatedMagic?this.simulatedMagic:this.plusMagic;
        return Math.floor(this.intellect * this.magicPotential * 10) + (magic);
    }

    get armor() {
        const armor = this.simulatedArmor?this.simulatedArmor:this.plusArmor;
        return Math.floor(this.stamina * this.armorPotential) + (armor);
    }

    get speed() {
        const speed = this.simulatedSpeed?this.simulatedSpeed:this.plusSpeed;
        return this.baseSpeed + speed;
    }

    get class() {
        return this.data.class;
    }

    get skillActiveProbability() {
        return this.data.skillactiveprobability;
    }

    get skillA() {
        return Skill.New(this.skills.a);
    }

    get skillB() {
        return Skill.New(this.skills.b);
    }

    get skillExtra() {
        return Skill.New(this.skills.extra);
    }

    equip(slot, itemId) {
        const item = new Item(itemId);
        if (!this.canEquip(slot, item)) {
            throw Error("can not equip item :" + item.name + " at " +  slot);
        }

        // 기존에 사용하고 있던 아이템이 있으면 제거한다
        let unequipItem = null;
        if (this.equipments[slot]) {
            unequipItem = this.unequip(slot);
        }

        this.equipments[slot] = item;
        // 아이템 옵션을 적용한다
        for(const option of item.options) {
            this.applyOption(option);
        }
        
        // 상태가 변했으므로 업데이트를 해야한다
        this.makeDirty();
        return unequipItem;
    }

    unequip(slot) {
        const item = this.equipments[slot];
        if (item) {
            this.equipments[slot] = null;
            // 아이템 옵션을 적용한다
            for(const option of item.options) {
                this.clearOption(option);
            }

            // 상태가 변했으므로 업데이트를 해야한다
            this.makeDirty();
        }

        return item;
    }

    canEquip(slot, item) {
        // 아이템 카테고리가 일치하는지 보고, 서브 카테고리가 일치하는지도 살펴본다.
        // TODO : 서브 카테고리는 나중에 처리
        return item.category === slot;
    }

    applyOption(option) {
        // TODO : 매번 옵션을 파싱하지 않고 미리 캐싱해놓을필요가 있다
        let result = true;
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
                if (this.health > 0) {
                    this.health += Number(option.args[0]);
                    this.health = Math.min(this.maxHealth, this.health);
                } else {
                    result = false;
                }
                break;
            case "healthrecovery":
                if (this.health > 0) {
                    this.health += Math.round(this.maxHealth * Number(option.args[0]));
                    this.health = Math.min(this.maxHealth, this.health);
                } else {
                    result = false;
                }
                break;
            case "recovery":
                this.health = this.maxHealth;
                break;
            case "maxhealth":
                this.plusMaxHealth += Number(option.args[0]);
                this.health = Math.min(this.maxHealth, this.health);
                break;
            case "strength":
                this.plusStrength += Number(option.args[0]);
                break;
            case "intellect":
                this.plusIntellect += Number(option.args[0]);
                break;
            case "agility":
                this.plusAgility += Number(option.args[0]);
                break;
            case "stamina":
                this.plusStamina += Number(option.args[0]);
                break;
            case "speed":
                this.plusSpeed += Number(option.args[0]);
                break;
            case "critical":
                this.plusCritical += Number(option.args[0]);
                break;
        }

        this.refreshSimulationData();
        return result;
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
            case "maxhealth":
                this.plusMaxHealth -= Number(option.args[0]);
                this.health = Math.max(0, this.health);
                break;
            case "strength":
                this.plusStrength -= Number(option.args[0]);
                break;
            case "intellect":
                this.plusIntellect -= Number(option.args[0]);
                break;
            case "agility":
                this.plusAgility -= Number(option.args[0]);
                break;
            case "stamina":
                this.plusStamina -= Number(option.args[0]);
                break;
            case "speed":
                this.plusSpeed -= Number(option.args[0]);
                break;
            case "critical":
                this.plusCritical -= Number(option.args[0]);
                break;
        }

        this.refreshSimulationData();
    }

    // exp 를 추가한다
    increaseExp(exp) {
        this.exp += exp;
        while(this.maxexp <= this.exp) {
            // 레벨업을 한다
            this.exp -= this.maxexp;
            this.level++;
            if (this.health > 0) {
                this.health = this.maxHealth;
            }
            // 이벤트를 외부에 알린다
        }
        // 업데이트 된 내용을 저장하도록 한다
        this.makeDirty();
    }

    get maxexp() {
        // TODO : 레벨 테이블을 나중에 개별 수치로 빼야한다.
        // 일단은 함수로 처리한다
        // 1레벨에서 5, 60레벨에서 백만이 되도록 2차함수를 만든다.
        const x = this.level;
        const a = -0.04;
        const b = 4.04;
        const result = x*x + a*x + b;
        return Math.floor(result);
    }

    load(data) {
        // 레벨, 경험치, 장비, 스킬내용을 올린다
        this.level = data.level;
        this.exp = data.exp;
        for (const slot in data.equips) {
            const itemId = data.equips[slot];
            this.equip(slot, itemId);
        }
        this.health = this.maxHealth;
        this.clearDirty();
    }

    save() {
        // 저장용 데이터를 생성한다
        const equips = {};
        for (const slot in this.equipments) {
            const item = this.equipments[slot];
            if (item) {
                equips[slot] = item.id;
            } 
        }

        return {
            id: this.id,
            level: this.level,
            exp: this.exp,
            equips: equips
        }
    }

    makeDirty() {
        this.dirty = true;
    }

    isDirty() {
        return this.dirty;
    }

    clearDirty() {
        return this.dirty = false;
    }

    // [정리]UI에서 장비 클릭 시, 실제 장비를 착용하는 것 은 아니지만, 그때그때 착용한 데이터를 보여주려고 만들다보니.. 이상해졌다.. 어떻게 수정해야할까.
    // (누를 때 마다 착용처리 하면 되긴 한다.)
    simulationEquip(slot, itemId) {
        this.refreshSimulationData();

        const item = new Item(itemId);
        if (!this.canEquip(slot, item)) {
            throw Error("can not equip item :" + item.name + " at " +  slot);
        }

        if (this.simulationEquipments[slot]) {
            this.simulationUnequip(slot);
        }

        for(const option of item.options) {
            this.simulationEquipments[slot] = item;
            this.applySimulationOption(option);
        }
    }

    simulationUnequip(slot) {
        const item = this.simulationEquipments[slot];
        if (item) {
            for(const option of item.options) {
                this.clearSimulationOption(option);
            }
        }
        this.simulationEquipments[slot] = null;
    }

    refreshSimulationData() {
        this.simulatedMaxHealth = this.plusMaxHealth;
        this.simulatedStrength = this.plusStrength;
        this.simulatedIntellect = this.plusIntellect;
        this.simulatedAgility = this.plusAgility;
        this.simulatedStamina = this.plusStamina;
        this.simulatedSpeed = this.plusSpeed;
        this.simulatedCritical = this.plusCritical;
        this.simulatedAttack = this.plusAttack;
        this.simulatedMagic = this.plusMagic;
        this.simulatedArmor = this.plusArmor;
        this.simulationEquipments.weapon = this.equipments.weapon;
        this.simulationEquipments.armor = this.equipments.armor;
        this.simulationEquipments.accessory = this.equipments.accessory;
    }

    applySimulationOption(option) {
        // TODO : 매번 옵션을 파싱하지 않고 미리 캐싱해놓을필요가 있다
        option = new ScriptParser(option);
        switch(option.name) {
            case "attack":
                this.simulatedAttack += Number(option.args[0]);
                break;
            case "matic":
                this.simulatedMagic += Number(option.args[0]);
                break;
            case "armor":
                this.simulatedArmor += Number(option.args[0]);
                break;
            case "health":
                break;
            case "maxhealth":
                this.simulatedMaxHealth += Number(option.args[0]);
                break;
            case "strength":
                this.simulatedStrength += Number(option.args[0]);
                break;
            case "intellect":
                this.simulatedIntellect += Number(option.args[0]);
                break;
            case "agility":
                this.simulatedAgility += Number(option.args[0]);
                break;
            case "stamina":
                this.simulatedStamina += Number(option.args[0]);
                break;
            case "speed":
                this.simulatedSpeed += Number(option.args[0]);
                break;
            case "critical":
                this.simulatedCritical += Number(option.args[0]);
                break;
        }
    }

    clearSimulationOption(option) {
        option =new ScriptParser(option);
        switch(option.name) {
            case "attack":
                this.simulatedAttack -= Number(option.args[0]);
                break;
            case "matic":
                this.simulatedMagic -= Number(option.args[0]);
                break;
            case "armor":
                this.simulatedArmor -= Number(option.args[0]);
                break;
            case "health":
                break;
            case "maxhealth":
                this.simulatedMaxHealth -= Number(option.args[0]);
                break;
            case "strength":
                this.simulatedStrength -= Number(option.args[0]);
                break;
            case "intellect":
                this.simulatedIntellect -= Number(option.args[0]);
                break;
            case "agility":
                this.simulatedAgility -= Number(option.args[0]);
                break;
            case "stamina":
                this.simulatedStamina -= Number(option.args[0]);
                break;
            case "speed":
                this.simulatedSpeed -= Number(option.args[0]);
                break;
            case "critical":
                this.simulatedCritical -= Number(option.args[0]);
                break;
        }
    }
}
