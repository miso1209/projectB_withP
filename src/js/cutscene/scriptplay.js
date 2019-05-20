import EventEmitter from 'events';
import {doorIn} from './door';
import { DIRECTIONS } from '../define';

const COMMAND_DIALOG = "dialog";
const COMMAND_DELAY = "delay";
const COMMAND_ENTERSTAGE = "enterstage";
const COMMAND_LEAVESTAGE = "leavestage";
const COMMAND_GOTO = "goto";
const COMMAND_ADDTAG = "addtag";

export default class ScriptPlay extends EventEmitter {
    constructor(script) {
        super();

        script = script || sampleScript;

        this.script = script;
        this.endIndex = script.length;
        this.currentIndex = 0;
    }

    play(game) {
        this.emit('start');
        game.emit('cutscene-start');
        // 컷신 준비를 한다
        this.next(game);
    }

    stop() {
        // TODO : 뭐를 해야하지???
    }

    next(game) {
        if (this.currentIndex === this.endIndex) {
            game.currentMode.endCutscene();
            // 컷신을 종료한다
            this.emit('complete');
            game.emit('cutscene-end');
            return;
        }

        const script = this.script[this.currentIndex];
        ++this.currentIndex;
        if (script.command === COMMAND_DIALOG) {
            // 다이얼로그를 띄운다
            game.emit('dialog-show', script.arguments, () => { this.next(game); });
        } else if (script.command === COMMAND_DELAY) { 
            const delay = script.arguments[0] * 1000;
            setTimeout(() => {
                this.next(game);
            }, delay);
        } else if (script.command === COMMAND_ENTERSTAGE) {
            const path = "assets/mapdata/" + script.arguments[0] + ".json";
            const eventName = script.arguments[1];  
            game.enterStage(path, eventName);
            game.once('stageentercomplete', () => {
                this.next(game);
            });
        }  else if (script.command === COMMAND_LEAVESTAGE) {
            const eventName = script.arguments[0];  
            game.leaveStage(eventName);
            game.once('stageleavecomplete', () => {
                this.next(game);
            });
        } else if (script.command === COMMAND_GOTO) {
            const x = script.arguments[0];  
            const y = script.arguments[1];  

            game.stage.once('moveend', () => { this.next(game); });
            game.stage.moveCharacter(game.currentMode.controller, x, y);
        } else if (script.command === COMMAND_ADDTAG) {
            game.addTag(script.arguments[0]);
            this.next(game); 
        }
    }


}
