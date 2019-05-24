import EventEmitter from 'events';
import { DIRECTIONS } from '../define';

// 일반 문을 열고 들어왔을때를 위한 연출
// 현재 필드에서의 들어오는 문과 진입 방향을 찾는다
// 문에서 들어오는 방향으로 살짝 

export class doorIn extends EventEmitter {
    constructor(game, gridX , gridY, direction, margin) {
        super();
        this.game = game;
        this.direction = direction;
        this.margin = margin;
        this.gridX = gridX;
        this.gridY = gridY;
    }
    
    async $play() {
        const stage = this.game.stage;
        const character = this.game.currentMode.controller;
        character.isMoving = true;
        
        // 페이드인 되면서 살짝 앞으로 나온다.
        const targetY = character.position.y;
        const targetX = character.position.x;
        const x = character.gridX;
        const y = character.gridY;

        if (this.direction === DIRECTIONS.SW) {
            character.position.x = stage.getTilePosXFor(x, y+this.margin);
            character.position.y = stage.getTilePosYFor(x, y+this.margin);
            character.changeVisualToDirection(DIRECTIONS.NE);
        } else if (this.direction === DIRECTIONS.NE) {
            character.position.x = stage.getTilePosXFor(x, y-this.margin);
            character.position.y = stage.getTilePosYFor(x, y-this.margin);
            character.changeVisualToDirection(DIRECTIONS.SW);
        } else if (this.direction === DIRECTIONS.NW) {
            character.position.x = stage.getTilePosXFor(x-this.margin, y);
            character.position.y = stage.getTilePosYFor(x-this.margin, y);
            character.changeVisualToDirection(DIRECTIONS.SE);
        } else {
            character.position.x = stage.getTilePosXFor(x+this.margin, y);
            character.position.y = stage.getTilePosYFor(x+this.margin, y);
            character.changeVisualToDirection(DIRECTIONS.NW);
        }


        stage.tweens.addTween(character, this.margin/4, { alpha: 1 }, 0, "linear", true);
        await stage.tweens.$addTween(character.position, this.margin/2, { x: targetX, y: targetY }, 0, "linear", true);
        
        character.isMoving = false;
        character.changeVisualToDirection(character.currentDir);
    }
}


export class doorOut extends EventEmitter {
    constructor(game, x , y, direction, margin) {
        super();
        this.game = game;
        this.direction = direction;
        this.margin = margin;
    }
    
    async $play() {
        const stage = this.game.stage;
        const character = this.game.currentMode.controller;
        const x = character.gridX;
        const y = character.gridY;

        
        // 페이드인 되면서 살짝 앞으로 나온다.
        ///const targetY = character.position.y;
        //const targetX = character.position.x;
        let targetX, targetY;

        if (this.direction === DIRECTIONS.SW) {
            targetX = stage.getTilePosXFor(x, y+this.margin);
            targetY = stage.getTilePosYFor(x, y+this.margin);
        } else if (this.direction === DIRECTIONS.NE) {
            targetX = stage.getTilePosXFor(x, y - this.margin);
            targetY = stage.getTilePosYFor(x, y - this.margin);
        } else if (this.direction === DIRECTIONS.NW) {
            targetX = stage.getTilePosXFor(x - this.margin, y);
            targetY = stage.getTilePosYFor(x - this.margin, y);
        } else {
            targetX = stage.getTilePosXFor(x + this.margin, y);
            targetY = stage.getTilePosYFor(x + this.margin, y);
        }

        character.isMoving = true;
        character.changeVisualToDirection(this.direction);


        stage.tweens.addTween(character, this.margin/4, { alpha: 0 }, this.margin/4, "linear", true);
        await stage.tweens.$addTween(character.position, this.margin/2, { x: targetX, y: targetY }, 0, "linear", true);
        
        character.isMoving = false;
        character.changeVisualToDirection(this.direction);
    }
}