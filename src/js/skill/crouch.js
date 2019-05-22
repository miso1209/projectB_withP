import SkillBase from "./skillbase";
import { TARGETING_TYPE } from "../battledeclare";

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
                // TODO: 방어력 증가시키는 버프를 적용해야 하는데.. 아직 버프시스템이 없다.
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