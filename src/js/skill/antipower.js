
import SkillBase from "./skillbase";
import { TARGETING_TYPE, CHARACTER_CAMP } from "../battledeclare";
import BlinkEffectBuff from "../buff/blinkeffectbuff";

export default class AntiPower extends SkillBase {
    constructor(data) {
        super(TARGETING_TYPE.ENEMY_ALL);
        this.setSkillData(data);

        this.tweens = new Tweens();
    }

    onFrame(frame) {
        // 프레임별로 실행해야 할 내용을 여기에 기록
        switch(frame) {
            case 1: {
                const vector = (this.owner.camp === CHARACTER_CAMP.ALLY)?  1 : - 1;
                const toX = this.owner.position.x + 8 * vector;
                const toY = this.owner.position.y - 4 * vector;

                this.originX = this.owner.position.x;
                this.originY = this.owner.position.y;

                this.tweens.addTween(this.owner.position, 0.15, { x: toX, y: toY }, 0, "easeOut", true );
                break;
            }
            case 11: {
                this.owner.animation_magic();
                break;
            }
            case 30: {
                this.targets.forEach((target) => {
                    target.removeBuff("antiPower");
                    const antiPower = this.calcSkillExpressions(this.target, this.skillExpressions[0]) * -1;

                    target.addBuff("antiPower", 10, new BlinkEffectBuff({
                        options: [`attack(${antiPower})`, `magic(${antiPower})`],
                        isAnimation: true,
                        sprite: 'antipowerloop',
                        animationLength: 32,
                        loop: true,
                        speed: 0.5,
                        offset: {
                            x: this.owner.animation.width / 2,
                            y: -this.owner.animation.height / 2
                        }
                    }));

                    this.addFontEffect({target: target, outputText: `Damage ▼`, fontSize: 7});
                    this.addEffect(target, { name: 'antipower', animation: true, animationLength: 16, removeFrame: 52, speed: 0.7 });
                });
                break;
            }
            case 55: {
                this.owner.animation_idle();
                break;
            }
            case 56: {
                this.tweens.addTween(this.owner.position, 0.15, { x: this.originX, y: this.originY }, 0, "easeOut", true );
                break;
            }
            case 66: {
                this.done();
                break;
            }
        }

        this.tweens.update();
    }
}