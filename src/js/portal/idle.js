import EventEmitter from 'events';
import { $sleep } from '../utils';

export default class idle {
    constructor(game, x , y) {
        this.gridX = x;
        this.gridY = y;

        game.exploreMode.lastX = x;
        game.exploreMode.lastY = y;
    }

    async $play() {
        
    }
}