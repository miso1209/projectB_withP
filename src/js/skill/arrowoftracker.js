
import SkillBase from "./skillbase";
import { TARGETING_TYPE, CHARACTER_CAMP, FRAME_PER_SEC } from "../battledeclare";

export default class ArrowOfTracker extends SkillBase {
    constructor(data) {
        super(TARGETING_TYPE.ENEMY_MIN_HP);
        this.setSkillData(data);

        this.tweens = new Tweens();
        this.updater = new Updater();
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

                this.tweens.addTween(this.owner.position, 0.15, {x: toX, y: toY }, 0, "easeOut", true );
                break;
            }
            case 11: {
                this.owner.animation_attack();
                break;
            } 
            case 30: {
                const arrow = this.addEffect(this.owner, { name: 'arrow.png', animation: false, removeFrame: 60 });

                let toX = this.target.position.x + this.target.width / 2;
                let toY = this.target.position.y - this.target.height - 24;
                toX += ((this.target.animation.offset && this.target.animation.offset.x)?this.target.animation.offset.x:0) * this.target.animation.scale.x;
                toY -= ((this.target.animation.offset && this.target.animation.offset.y)?(this.target.animation.offset.y):0) * this.target.animation.scale.y;
                
                const duration = 50;

                const dist = {
                    x: toX - arrow.position.x,
                    y: toY - arrow.position.y
                };

                const gravity = 1.6;

                const speed = {
                    x: dist.x / duration,
                    y: (dist.y / duration) - ((duration-1)/2*gravity)
                }

                this.updater.add(duration, () => {
                    arrow.position.x += speed.x;
                    arrow.position.y += speed.y;
                    arrow.rotation = Math.atan2(speed.y, speed.x);

                    speed.y += gravity;
                });

                this.tweens.addTween(arrow, 0.1, { alpha: 0 }, duration / FRAME_PER_SEC, "easeOut", true );
                break;
            }
            case 80: {
                this.addEffect(this.target, { name: 'arrowoftracker', animation: true, animationLength: 7, removeFrame: 60, speed: 0.2 });
                let damage = this.calcSkillExpressions(this.owner, this.skillExpressions[0]);

                this.hit(damage, this.target, this.isCritical(this.owner.critical));
                break;
            }
            case 95: {
                this.owner.animation_idle();
            }
            case 96: {
                this.tweens.addTween(this.owner.position, 0.15, { x: this.originX, y: this.originY }, 0, "easeOut", true );
                break;
            }
            case 106: {
                this.done();
                break;
            }
        }

        this.tweens.update();
        this.updater.update();
    }
}