// battle 캐릭터 스탯에 관련된 클래스를 작성한다.

// 버프에 의한 스텟 변화값을 계산해주는 클래스
// 캐릭터 사망 시, 전투 불능 시 버프 다 제거하는거 만들자.
export class StatManager {
    constructor(base) {
        this.baseStat = Object.assign({}, base);
        this.statPointer = base;
        this.buffs = {};
    }

    getStat() {
        return this.statPointer;
    }

    update() {
        for (let key in this.buffs) {
            const buff = this.buffs[key];

            buff.update();
            if (buff.isEnd()) {
                this.removeBuff(buff);
            }
        }
    }

    addBuff(buff) {
        this.buffs[buff.name] = buff;
        this.calculateStat();
    }

    removeBuff(buff) {
        for (let stat in this.buffs[buff.name].options.addBuffs) {
            this.buffs[buff.name].options.addBuffs[stat] = 0;
        }
        for (let stat in this.buffs[buff.name].options.multiBuffs) {
            this.buffs[buff.name].options.multiBuffs[stat] = 1;
        }
        this.calculateStat();
        delete this.buffs[buff.name];
    }

    calculateStat() {
        const base = Object.assign({}, this.baseStat);
        const resultStat = {};

        for (let key in this.buffs) {
            const addCalcBuffs = this.buffs[key].options.addBuffs;
            const multiCalcBuffs = this.buffs[key].options.multiBuffs;

            for (let stat in addCalcBuffs) {
                if (resultStat[stat]) {
                    resultStat[stat] += addCalcBuffs[stat];
                } else {
                    resultStat[stat] = base[stat] + addCalcBuffs[stat];
                }
            }

            for (let stat in multiCalcBuffs) {
                if (resultStat[stat]) {
                    resultStat[stat] *= multiCalcBuffs[stat];
                } else {
                    resultStat[stat] = base[stat] * multiCalcBuffs[stat];
                }
            }
        }

        for (let key in resultStat) {
            this.statPointer[key] = resultStat[key];
        }
    }
}

// 기본적인 모든 상태이상, 버프에 기반이 되는 클래스. actionFrame마다 action을 수행한다. action은 알아서 작성하도록 하자.
export class BaseBuff {
    constructor (name, options) {
        const baseOptions = {
            target: null,
            retensionFrame: 0,
            actionFrame: 0,
            buffEffect: {},
            addBuffs: {},
            multiBuffs: {}
        };

        this.name = name;
        this.options = Object.assign(baseOptions, options);
    }

    isEnd() {
        return this.options.retensionFrame <= 0;
    }

    update() {
        if (this.options.retensionFrame > 0) {
            this.options.retensionFrame --;
            
            if (this.options.actionFrame > 0 && this.options.retensionFrame % this.options.actionFrame === 0) {
                this.action();   
            }
        }
    }

    action() {
    }
}

export class Poison extends BaseBuff {
    constructor(name, options) {
        super(name, options);
    }

    // HP 관련은 전부 여기로 빼서 적용한다.
    action() {
        if (this.options.target) {
            this.options.taget.onDamage(this.options.addBuff.hp);
        } else {
            console.log('target error');
        }
    }
}