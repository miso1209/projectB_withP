import { DIRECTIONS } from './../../define';

// 일반 문을 열고 들어왔을때를 위한 연출
// 현재 필드에서의 들어오는 문과 진입 방향을 찾는다
// 문에서 들어오는 방향으로 살짝 

export default class EntranceDoor {
    constructor(game, x , y, direction, margin) {
        this.game = game;
        this.spawn = { x: x, y: y, direction: direction };
        this.margin = margin;
    }

    setCharacter(character) {
        const stage = this.game.stage;
        this.character = character;
        stage.addCharacter(character, this.spawn.x, this.spawn.y);
        stage.checkForFollowCharacter(character, true);
    }

    prepare() {
        
    }

    start(onComplete) {
        const character = this.character;
        const stage = this.game.stage;
        
        // 페이드인 되면서 살짝 앞으로 나온다.
        const targetY = character.position.y;
        const targetX = character.position.x;

        if (this.spawn.direction === DIRECTIONS.SE) {
            character.position.x = stage.getTilePosXFor(this.spawn.x, this.spawn.y-this.margin);
            character.position.y = stage.getTilePosYFor(this.spawn.x, this.spawn.y-this.margin);
        } else if (this.spawn.direction === DIRECTIONS.NW) {
            character.position.x = stage.getTilePosXFor(this.spawn.x, this.spawn.y + this.margin);
            character.position.y = stage.getTilePosYFor(this.spawn.x, this.spawn.y + this.margin);
        } else if (this.spawn.direction === DIRECTIONS.SW) {
            character.position.x = stage.getTilePosXFor(this.spawn.x + this.margin, this.spawn.y);
            character.position.y = stage.getTilePosYFor(this.spawn.x + this.margin, this.spawn.y);
        } else {
            character.position.x = stage.getTilePosXFor(this.spawn.x - this.margin, this.spawn.y);
            character.position.y = stage.getTilePosYFor(this.spawn.x - this.margin, this.spawn.y);
        }

        
        stage.tweens.addTween(character.position, 1, { x: targetX, y: targetY }, 0, "linear", true);
        stage.tweens.addTween(character, 0.5, { alpha: 1 }, 0, "linear", true);

        // 애니메이션을 넣는다

        character.isMoving = true;
        character.changeVisualToDirection(this.spawn.direction);

        // 끝나면 이벤트를 넣는다.
        setTimeout(() => {
            character.isMoving = false;
            character.changeVisualToDirection(this.spawn.direction);
            if (onComplete) {
                onComplete();
            }
        },1000);
    }
}