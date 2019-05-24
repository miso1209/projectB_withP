
import SkillBase from "./skillbase";
import { TARGETING_TYPE } from "../battledeclare";

export default class FireBolt extends SkillBase {
    constructor() {
        super(TARGETING_TYPE.ENEMY_FRONT_TANK);

        this.tweens = new Tweens();
    }

    onFrame(frame) {
        // 프레임별로 실행해야 할 내용을 여기에 기록
        switch(frame) {
            case 1: {
                this.owner.animation_attack();
                break;
            }
            case 40: {
                const fireBall = this.addEffect(this.owner, { name: 'fireBall.png', animation: false, removeFrame: 60 });
                fireBall.rotation = Math.atan2(this.target.position.y - this.owner.y, this.target.position.x - this.owner.position.x);

                const toX = this.target.position.x + this.target.width / 2;
                const toY = this.target.position.y - this.target.height / 2;

                this.tweens.addTween(fireBall, 0.1, { alpha: 0 }, 0.15, "easeOut", true );
                this.tweens.addTween(fireBall.position, 0.25, { x: toX, y: toY }, 0, "easeOut", true );
                break;
            }
            case 50: {
                this.addEffect(this.target, { name: 'explosion', animation: true, animationLength: 16, removeFrame: 60, speed: 0.5 });
                this.hit(this.owner, this.target);
                break;
            }
            case 65: {
                this.owner.animation_idle();
            }
            case 70: {
                this.done();
                break;
            }
        }

        this.tweens.update();
    }
}