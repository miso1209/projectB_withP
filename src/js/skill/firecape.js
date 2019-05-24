
import SkillBase from "./skillbase";
import { TARGETING_TYPE, CHARACTER_CAMP } from "../battledeclare";

export default class FireCape extends SkillBase {
    constructor() {
        super(TARGETING_TYPE.SELF);

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
                this.owner.animation_attack();
                break;
            }
            case 51: {
                this.addEffect(this.owner, { name: 'firerainprop', animation: true, animationLength: 7, removeFrame: 15, speed: 0.5 });
                break;
            }
            case 75: {
                this.owner.animation_idle();
                break;
            }
            case 76: {
                this.tweens.addTween(this.owner.position, 0.15, { x: this.originX, y: this.originY }, 0, "easeOut", true );
                break;
            }
            case 86: {
                this.done();
                break;
            }
        }

        this.tweens.update();
    }
}