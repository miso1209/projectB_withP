
import SkillBase from "./skillbase";
import { TARGETING_TYPE } from "../battledeclare";

export default class ShotArrow extends SkillBase {
    constructor() {
        super(TARGETING_TYPE.ENEMY_BACK_CARRY);

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
                const arrow = this.addEffect(this.owner, { name: 'arrow.png', animation: false, removeFrame: 60 });

                const toX = this.target.position.x + this.target.width / 2;
                const toY = this.target.position.y - this.target.height / 2;

                // rotation x 속도, y속도 어덯게 알아서 주지..? getter, setter로 어떻게 처리가 가능할지도 모르겠는데.. 우선 보류.
                // x, 속도, y속도 구할 수 있다. => 사실 x속도는 등속이니까 그대로, y 속도만 arrowYEase함수 미분하면 알 수 있을것 같은데..
                // 어떻게 즉각즉각 y속도에 대한 값으로 rotation을 구해서 줄 수 있을까?.. 목표값 또한 어떻게 알아낼껀데..?
                // 가라로 그냥 로테이션 돌려도 잘 안보일지 모르겠다는 생각이 좀 드는 것 같다.. 왜냐면 궤적이 비슷하지 않을까? => 응, 아니야.
                this.tweens.addTween(arrow, 0.02, { alpha: 0 }, 0.48, "easeOut", true );
                this.tweens.addTween(arrow.position, 0.5, {x: toX }, 0, "linear", false );
                this.tweens.addTween(arrow.position, 0.5, {y: toY }, 0, "arrrowYEase", false );
                break;
            }
            case 65: {
                this.addEffect(this.target, { name: 'shoted', animation: true, animationLength: 18, removeFrame: 60, speed: 0.5 });
                this.hit(this.owner, this.target);
                break;
            }
            case 80: {
                this.owner.animation_idle();
            }
            case 85: {
                this.done();
                break;
            }
        }

        this.tweens.update();
    }
}