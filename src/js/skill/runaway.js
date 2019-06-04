import SkillBase from "./skillbase";
import { CHARACTER_CAMP, TARGETING_TYPE } from "../battledeclare";

export default class Runaway extends SkillBase {
    constructor(data) {
        super(TARGETING_TYPE.ENEMY_FRONT_TANK);
        this.setSkillData(data);

        this.tweens = new Tweens();
    }

    onFrame(frame) {
        
        // 프레임별로 실행해야 할 내용을 여기에 기록
        switch(frame) {
            case 1: {
                this.owner.animation_idle();
                this.owner.alpha = 1;
                this.originX = this.owner.position.x;
                this.originY = this.owner.position.y;
            }
            case 21: {
                this.owner.animation_walk();
                const vector = (this.owner.camp === CHARACTER_CAMP.ALLY)?  1 : - 1;
                const toX = this.owner.position.x + 16 * vector;
                const toY = this.owner.position.y - 8 * vector;

                this.tweens.addTween(this.owner.position, 0.5, { x: toX, y: toY }, 0, "linear", true );
                this.tweens.addTween(this.owner, 0.5, { alpha: 0 }, 0, "linear", true );
                break;
            } 
            case 61: {
                this.owner.animation_idle();
                this.owner.position.x = this.originX;
                this.owner.position.y = this.originY;
                break;
            }
            case 62: {
                this.done();
                break;
            }
        }

        this.tweens.update();
    }
}