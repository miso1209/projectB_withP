
import SkillBase from "./skillbase";
import { TARGETING_TYPE } from "../battledeclare";

export default class FireBolt extends SkillBase {
    constructor(data) {
        super(TARGETING_TYPE.ENEMY_FRONT_TANK);
        this.setSkillData(data);

        this.tweens = new Tweens();
    }

    onFrame(frame) {
        // 프레임별로 실행해야 할 내용을 여기에 기록
        switch(frame) {
            case 1: {
                this.owner.animation_attack();
                break;
            }
            case 30: {
                Sound.playSound('fire_bolt_shot_1.wav', { singleInstance: true });
                const fireBall = this.addEffect(this.owner, { name: 'fireball.png', animation: false, removeFrame: 60 });

                let toX = this.target.position.x + this.target.width / 2;
                let toY = this.target.position.y - this.target.height - 24;
                toX += ((this.target.animation.offset && this.target.animation.offset.x)?this.target.animation.offset.x:0)* this.target.animation.scale.x;
                toY -= ((this.target.animation.offset && this.target.animation.offset.y)?(this.target.animation.offset.y):0)* this.target.animation.scale.y;

                const dist = {
                    x: toX - fireBall.position.x,
                    y: toY - fireBall.position.y
                }
                fireBall.rotation = Math.atan2(dist.y, dist.x);

                this.tweens.addTween(fireBall.position, 0.25, { x: toX, y: toY }, 0, "easeOut", true );
                this.tweens.addTween(fireBall, 0.1, { alpha: 0 }, 0.15, "easeOut", true );

                break;
            }
            case 40: {
                Sound.playSound('fire_bolt_hit_1.wav', { singleInstance: true });
                this.addEffect(this.target, { name: 'explosion', animation: true, animationLength: 16, removeFrame: 60, speed: 0.5 });
                let damage = this.calcSkillExpressions(this.owner, this.skillExpressions[0]);

                const isCritical = this.isCritical(this.owner.critical);
                this.hit(damage, this.target, isCritical);
                break;
            }
            case 50: {
                this.owner.animation_idle();
            }
            case 60: {
                this.done();
                break;
            }
        }

        this.tweens.update();
    }
}