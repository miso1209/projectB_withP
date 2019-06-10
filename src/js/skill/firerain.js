
import SkillBase from "./skillbase";
import { TARGETING_TYPE, CHARACTER_CAMP } from "../battledeclare";

export default class FireRain extends SkillBase {
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
                const vector = (this.owner.camp === CHARACTER_CAMP.ALLY)?  1 : - 1;
                const toX = this.owner.position.x + 8 * vector;
                const toY = this.owner.position.y - 4 * vector;

                this.originX = this.owner.position.x;
                this.originY = this.owner.position.y;

                this.tweens.addTween(this.owner.position, 0.15, { x: toX, y: toY }, 0, "easeOut", true );
                break;
            }
            case 11: {
                this.owner.animation_attack();
                break;
            }
            case 51: {
                this.addEffect(this.owner, { name: 'firerainprop', animation: true, animationLength: 7, removeFrame: 15, speed: 0.5 });
                break;
            }
            case 75: {
                let delay = 0;

                this.targets.forEach((target) => {
                    const fireBall = this.addEffect(this.owner, { name: 'fireBall.png', animation: false, removeFrame: 60 });
                    fireBall.position.y -= 500;

                    const dist = {
                        x: target.position.x - fireBall.position.x,
                        y: target.position.y - fireBall.position.y
                    }
                    fireBall.rotation = Math.atan2(dist.y, dist.x);
    
                    const toX = target.position.x + target.width / 2;
                    const toY = target.position.y - target.height / 2;
                    this.tweens.addTween(fireBall.position, 0.25, { x: toX, y: toY }, delay, "easeOut", false );
                    this.tweens.addTween(fireBall, 0.07, { alpha: 0 }, delay + 0.18, "linear", false );

                    delay += 0.1;
                });
                break;
            }
            case 88: {
                this.owner.animation_idle();
                break;
            }
            case 100: {
                this.targets.forEach((target) => {
                    this.addEffect(target, { name: 'explosion', animation: true, animationLength: 16, removeFrame: 60, speed: 0.5 });
                    let damage = this.calcSkillExpressions(this.owner, this.skillExpressions[0]);

                    this.hit(damage, target, this.isCritical(this.owner.critical));
                });
                break;
            }
            case 91: {
                this.tweens.addTween(this.owner.position, 0.15, { x: this.originX, y: this.originY }, 0, "easeOut", true );
                break;
            }
            case 151: {
                this.done();
                break;
            }
        }

        this.tweens.update();
    }
}