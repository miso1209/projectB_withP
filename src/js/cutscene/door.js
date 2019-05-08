import EventEmitter from 'events';
import { DIRECTIONS } from '../define';

// 일반 문을 열고 들어왔을때를 위한 연출
// 현재 필드에서의 들어오는 문과 진입 방향을 찾는다
// 문에서 들어오는 방향으로 살짝 

export class doorIn extends EventEmitter {
    constructor(game, x , y, direction, margin) {
        super();
        this.game = game;
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.margin = margin;
    }
    
    play() {
        const stage = this.game.stage;
        const character = this.game.currentMode.controller;
        
        // 페이드인 되면서 살짝 앞으로 나온다.
        const targetY = character.position.y;
        const targetX = character.position.x;

        if (this.direction === DIRECTIONS.SE) {
            character.position.x = stage.getTilePosXFor(this.x, this.y-this.margin);
            character.position.y = stage.getTilePosYFor(this.x, this.y-this.margin);
        } else if (this.direction === DIRECTIONS.NW) {
            character.position.x = stage.getTilePosXFor(this.x, this.y + this.margin);
            character.position.y = stage.getTilePosYFor(this.x, this.y + this.margin);
        } else if (this.direction === DIRECTIONS.SW) {
            character.position.x = stage.getTilePosXFor(this.x + this.margin, this.y);
            character.position.y = stage.getTilePosYFor(this.x + this.margin, this.y);
        } else {
            character.position.x = stage.getTilePosXFor(this.x - this.margin, this.y);
            character.position.y = stage.getTilePosYFor(this.x - this.margin, this.y);
        }

        
        character.isMoving = true;
        character.changeVisualToDirection(this.direction);


        stage.tweens.addTween(character, this.margin/4, { alpha: 1 }, 0, "linear", true);
        stage.tweens.addTween(character.position, this.margin/2, { x: targetX, y: targetY }, 0, "linear", true, () => {
            character.isMoving = false;
            character.changeVisualToDirection(this.direction);
            this.emit('complete');
        });

    }
}


export class doorOut extends EventEmitter {
    constructor(game, x , y, direction, margin) {
        super();
        this.game = game;
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.margin = margin;
    }
    
    play() {
        const stage = this.game.stage;
        const character = this.game.currentMode.controller;
        
        // 페이드인 되면서 살짝 앞으로 나온다.
        ///const targetY = character.position.y;
        //const targetX = character.position.x;
        let targetX, targetY;

        if (this.direction === DIRECTIONS.SE) {
            targetX = stage.getTilePosXFor(this.x, this.y+this.margin);
            targetY = stage.getTilePosYFor(this.x, this.y+this.margin);
        } else if (this.direction === DIRECTIONS.NW) {
            targetX = stage.getTilePosXFor(this.x, this.y - this.margin);
            targetY = stage.getTilePosYFor(this.x, this.y - this.margin);
        } else if (this.direction === DIRECTIONS.SW) {
            targetX = stage.getTilePosXFor(this.x - this.margin, this.y);
            targetY = stage.getTilePosYFor(this.x - this.margin, this.y);
        } else {
            targetX = stage.getTilePosXFor(this.x + this.margin, this.y);
            targetY = stage.getTilePosYFor(this.x + this.margin, this.y);
        }

        character.isMoving = true;
        character.changeVisualToDirection(this.direction);


        stage.tweens.addTween(character, this.margin/4, { alpha: 0 }, this.margin/4, "linear", true);
        stage.tweens.addTween(character.position, this.margin/2, { x: targetX, y: targetY }, 0, "linear", true, () => {
            character.isMoving = false;
            character.changeVisualToDirection(this.direction);
            this.emit('complete');
        });
    }
}