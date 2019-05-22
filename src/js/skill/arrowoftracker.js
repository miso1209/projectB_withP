
import SkillBase from "./skillbase";
import { TARGETING_TYPE, CHARACTER_CAMP } from "../battledeclare";

export default class ArrowOfTracker extends SkillBase {
    constructor() {
        super(TARGETING_TYPE.ENEMY_MIN_HP);

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

                this.tweens.addTween(this.owner.position, 0.15, {x: toX, y: toY }, 0, "easeOut", true );
                break;
            }
            case 11: {
                // 번쩍 이펙트? 뭐 이펙트는 추후 추가.. 중요한건 화살 높이와 rotation처리 어떻게 할래..?
                this.owner.animation_attack();
                break;
            } 
            case 50: {
                // 높이랑 rotation처리 어떻게 하면 좋을까..??
                const arrow = this.addEffect(this.owner, { name: 'arrow.png', animation: false, removeFrame: 60 });

                const toX = this.target.position.x + this.target.width / 2;
                const toY = this.target.position.y - this.target.height / 2;

                this.tweens.addTween(arrow, 0.02, { alpha: 0 }, 0.48, "easeOut", true );
                this.tweens.addTween(arrow.position, 0.5, { x: toX }, 0, "linear", false );
                this.tweens.addTween(arrow.position, 0.5, { y: toY }, 0, "arrrowYEase", false );
                break;
            }
            case 75: {
                this.addEffect(this.target, { name: 'shoted', animation: true, animationLength: 18, removeFrame: 60, speed: 0.5 });
                this.hit(this.owner, this.target);
                break;
            }
            case 90: {
                this.owner.animation_idle();
            }
            case 91: {
                this.tweens.addTween(this.owner.position, 0.15, { x: this.originX, y: this.originY }, 0, "easeOut", true );
                break;
            }
            case 101: {
                this.done();
                break;
            }
        }

        this.tweens.update();
    }
}