export default class Skill {
    constructor(targetingType) {
        this.targetingType = targetingType;
        this.frame = 0;
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

    hit(attacker, target) {
        const damage = Math.round(attacker.attack - target.armor);
        this.addFontEffect({target: target, outputText: '-' + damage});
        target.onDamage(damage);
    }

    done() {
        this.isFinished = true;
    }
}