
import SkillBase from "./skillbase";
import { TARGETING_TYPE } from "../battledeclare";

export default class Breath extends SkillBase {
    constructor(data) {
        super(TARGETING_TYPE.ENEMY_ALL);
        this.setSkillData(data);

        this.tweens = new Tweens();
    }

    onFrame(frame) {
        // 프레임별로 실행해야 할 내용을 여기에 기록
        switch(frame) {
            case 1: {
                this.setCoolTime();
                this.owner.animation_attack();
                break;
            }
            case 40: {
                const fireBall = this.addEffect(this.owner, { name: 'breath', animation: true, loop:true, animationLength: 75, removeFrame: 200, speed: 1, offset: { x : -45, y: 25 }});
                fireBall.width = 400;
                fireBall.anchor.x = 0.2;
                const startRotation = Math.atan2(30, -60);
                const toRotation = Math.atan2(60, -30);

                fireBall.rotation = startRotation;
                this.tweens.addTween(fireBall, 2.5, { rotation: toRotation }, 0.2, "linear", false );
                this.tweens.addTween(fireBall, 0.2, { alpha: 0 }, 3, "linear", false );
                this.targets.forEach((target) => {
                    if (target.health > 0) {
                        this.addEffect(target, { name: 'explosion', animation: true, animationLength: 16, removeFrame: 60, speed: 0.5 });
                        let damage = this.calcSkillExpressions(this.owner, this.skillExpressions[0]);
    
                        this.hit(damage, target, this.isCritical(this.owner.critical));
                    }
                });
                break;
            }
            case 90: {
                this.targets.forEach((target) => {
                    if (target.health > 0) {
                        this.addEffect(target, { name: 'explosion', animation: true, animationLength: 16, removeFrame: 60, speed: 0.5 });
                        let damage = this.calcSkillExpressions(this.owner, this.skillExpressions[0]);
    
                        this.hit(damage, target, this.isCritical(this.owner.critical));
                    }
                });
                break;
            }
            case 140: {
                this.targets.forEach((target) => {
                    if (target.health > 0) {
                        this.addEffect(target, { name: 'explosion', animation: true, animationLength: 16, removeFrame: 60, speed: 0.5 });
                        let damage = this.calcSkillExpressions(this.owner, this.skillExpressions[0]);
    
                        this.hit(damage, target, this.isCritical(this.owner.critical));
                    }
                });
                break;
            }
            case 190: {
                this.targets.forEach((target) => {
                    if (target.health > 0) {
                        this.addEffect(target, { name: 'explosion', animation: true, animationLength: 16, removeFrame: 60, speed: 0.5 });
                        let damage = this.calcSkillExpressions(this.owner, this.skillExpressions[0]);
    
                        this.hit(damage, target, this.isCritical(this.owner.critical));
                    }
                });
                break;
            }
            case 240: {
                this.targets.forEach((target) => {
                    if (target.health > 0) {
                        this.addEffect(target, { name: 'explosion', animation: true, animationLength: 16, removeFrame: 60, speed: 0.5 });
                        let damage = this.calcSkillExpressions(this.owner, this.skillExpressions[0]);
    
                        this.hit(damage, target, this.isCritical(this.owner.critical));
                    }
                });
                break;
            }
            case 250: {
                this.owner.animation_idle();
            }
            case 260: {
                this.done();
                break;
            }
        }

        this.tweens.update();
    }
}