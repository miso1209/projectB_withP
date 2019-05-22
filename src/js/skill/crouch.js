import SkillBase from "./skillbase";
import { CHARACTER_CAMP, TARGETING_TYPE } from "../battledeclare";

export default class Crouch extends SkillBase {
    constructor() {
        super(TARGETING_TYPE.ENEMY_FRONT_TANK);

        this.tweens = new Tweens();
    }

    onFrame(frame) {
        
        // 프레임별로 실행해야 할 내용을 여기에 기록
        switch(frame) {
            case 1: {
                this.owner.animation_idle();
                break;
            }
            case 11: {
                this.owner.animation_crouch();
                break;
            }
            case 31: {
                this.done();
                break;
            }
        }

        this.tweens.update();
    }
}