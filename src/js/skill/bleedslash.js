import SkillBase from "./skillbase";
import { CHARACTER_CAMP, TARGETING_TYPE } from "../battledeclare";
import BlinkEffectBuff from "../buff/blinkeffectbuff";

export default class BleedSlash extends SkillBase {
    constructor(data) {
        super(TARGETING_TYPE.ENEMY_FRONT_TANK);
        this.setSkillData(data);

        this.tweens = new Tweens();
    }

    onFrame(frame) {
        
        // 프레임별로 실행해야 할 내용을 여기에 기록
        switch(frame) {
            case 1: {
                this.setCoolTime();
                const vector = (this.owner.camp === CHARACTER_CAMP.ALLY)?  1 : - 1;
                const toX = this.owner.position.x + 16 * vector;
                const toY = this.owner.position.y - 8 * vector;

                this.originX = this.owner.position.x;
                this.originY = this.owner.position.y;

                this.tweens.addTween(this.owner.position, 0.15, { x: toX, y: toY }, 0, "easeOut", true );
                break;
            }
            case 11: {
                this.owner.animation_attack();
                break;
            } 
            case 30: {
                this.target.removeBuff("bleedSlash");
                this.target.addBuff("bleedSlash", 5, new BlinkEffectBuff({
                    abilityOptions: [],
                    statusOptions: [],
                    isAnimation: true,
                    sprite: 'bleed',
                    animationLength: 8,
                    loop: true,
                    speed: 0.5,
                    offset: {
                        x: this.owner.animation.width / 2,
                        y: -this.owner.animation.height + 10
                    },
                    turnAction: () => {
                        let damage = this.calcSkillExpressions(this.owner, this.skillExpressions[1]);
                        if (this.target.health > damage - this.target.armor) {
                            this.hit(damage, this.target, false);
                        } else {
                            this.hit(this.target.health + this.target.armor - 1, this.target, false);
                        }
                    }
                }));

                // TODO : 데미지 계산 공식을 어디서 가져와야 할까??
                this.addEffect(this.target, { name: 'arrowoftracker', animation: true, animationLength: 7, removeFrame: 60, speed: 0.2 });
                let damage = this.calcSkillExpressions(this.owner, this.skillExpressions[0]);

                this.hit(damage, this.target, this.isCritical(this.owner.critical));
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