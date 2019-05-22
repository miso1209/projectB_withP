
import SkillBase from "./skillbase";
import { TARGETING_TYPE, CHARACTER_CAMP } from "../battledeclare";

export default class Heal extends SkillBase {
    constructor() {
        super(TARGETING_TYPE.ALLY_ALL);

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
            case 50: {
                this.targets.forEach((target) => {
                    this.addEffect(target, { name: 'healeffect', animation: true, animationLength: 25, removeFrame: 52, speed: 0.7 });
                });
                break;
            }
            case 73: {
                this.owner.animation_idle();
                break;
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
    }
}