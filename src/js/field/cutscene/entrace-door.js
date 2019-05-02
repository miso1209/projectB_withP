import { DIRECTIONS } from './../../define';

// 일반 문을 열고 들어왔을때를 위한 연출
// 현재 필드에서의 들어오는 문과 진입 방향을 찾는다
// 문에서 들어오는 방향으로 살짝 

export default class EntranceDoor {
    constructor(stage) {
        this.stage = stage;
    }

    prepare(character) {
        // 스테이지에서 입구위치와 방향을 찾아야 한다.
        character.alpha = 0;
        character.changeVisualToDirection(DIRECTIONS.SE);
        this.stage.addCharacter(character, 0, 1);
        this.stage.checkForFollowCharacter(character, true);
        // 캐릭터 방향을 돌린다

        this.character = character;
    }

    start(onComplete) {
        const character = this.character;
        const stage = this.stage;

        // 페이드인 되면서 살짝 앞으로 나온다.
        const targetY = character.position.y;
        const targetX = character.position.x;
        character.position.x = stage.getTilePosXFor(0, -1);
        character.position.y = stage.getTilePosYFor(0, -1);
        stage.tweens.addTween(character.position, 1, { x: targetX, y: targetY }, 0, "linear", true);
        stage.tweens.addTween(character, 0.5, { alpha: 1 }, 0, "linear", true);

        // 애니메이션을 넣는다
        character.setAnimation("walk_se");

        // 끝나면 이벤트를 넣는다.
        setTimeout(() => {
            character.setAnimation("idle_se");
            if (onComplete) {
                onComplete();
            }
        },1000);
    }
}