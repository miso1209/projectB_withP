import ScriptParser from "../scriptparser";

export default class Skill {
    constructor(targetingType) {
        this.targetingType = targetingType;
        this.frame = 0;
    }

    setCoolTime() {
        this.owner.coolTime = this.coolTime;
        this.owner.maxCoolTime = this.maxCoolTime;
        this.owner.isExtraSkillIn = false;
    }
    
    get skillExpressions() {
        return this.data.skillExpressions;
    }

    // extra skil에만 들어있다.
    get coolTime() {
        return this.data.coolTime?this.data.coolTime:0;
    }

    get maxCoolTime() {
        return this.data.maxCoolTime?this.data.maxCoolTime:1;
    }

    isCritical(criticalProbability) {
        return Math.random() < criticalProbability;
    }

    // 계수에 대한 대상자의 능력치를 반환한다.
    calcSkillExpressions(target, skillExpression) {
        let result = 0;
        skillExpression.forEach((script) => {
            const scriptParser = new ScriptParser(script);
            result += this.getStat(target, scriptParser);
        });

        return Math.round(result);
    }
    
    getStat(target, scriptParser) {
        let result = 0;
        switch(scriptParser.name) {
            case "attackCoefficient":
                result = target.attack * parseFloat(scriptParser.args[0]);
                break;

            case "magicCoefficient":
                result = target.magic * parseFloat(scriptParser.args[0]);
                break;

            case "armorCoefficient":
                result = target.armor * parseFloat(scriptParser.args[0]);
                break;

            case "maxHealthCoefficient":
                result = target.maxHealth * parseFloat(scriptParser.args[0]);
                break;

            default:
                result = Number(scriptParser.args[0]);
                break;
        }

        return result;
    }

    setSkillData(data) {
        this.data = data;
    }

    setTarget(target) {
        // 멀티 타겟과 싱글타겟을 구분해서 처리한다
        // 일단 임시로 이렇게 하고 나중에 정리하자
        this.targets = target;
        if (target.length > 0) {
            this.target = target[0];
        }
    }

    setOwner(owner) {
        this.owner = owner;
    }

    setEffects(effects) {
        this.effects = effects;
    }

    update() {
        // 매프레임업데이트를 한다
        ++this.frame;
        this.onFrame(this.frame);
    }

    onFrame(frame) {
        // nothing to do
    }

    addEffect(...args) {
        return this.effects.addEffect(...args);
    }

    addFontEffect(...args) {
        this.effects.addFontEffect(...args);
    }

    hit(attack, target, isCritical) {
        let damage = Math.round(attack - target.armor);

        damage = damage<=0?0:damage;

        if (isCritical) {
            damage = Math.round(damage * 1.5);
            this.addFontEffect({target: target, outputText: 'Critical', fontSize: 7, offset: { x: -5, y: -10 }, color: '#FF0000'});
        }

        this.addFontEffect({target: target, outputText: '-' + damage});
        
        target.onDamage(damage);
    }

    done() {
        this.isFinished = true;
    }
}