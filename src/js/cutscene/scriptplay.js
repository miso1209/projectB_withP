import EventEmitter from 'events';
import {doorIn} from './door';
import { DIRECTIONS } from '../define';
// 컷신을 스크립트와 시켜서 플레이를 시킨다

// 튜토리얼 컷신을 샘플로 작성해본다
const sampleScript = [
    {
        command: "enterstage",
        arguments: ["house", { x: 0, y: 1, direction: DIRECTIONS.SE, margin: 2}],
    }, {
        command: "delay",
        arguments: [0.5],
    }, {
        command: "dialog",
        arguments: [
            { text: "돈이 없다고 이런곳에서 살아야 하나 ...", speaker: 1},
            { text: "난 어제 내집에서 잘 수 있을까", speaker: 1},
            { text: "... 우울해지네", speaker: 1},
            { text: "아 모르겠다! 일단 작업용 탁자나 찾아보자", speaker: 1}]
    },
];

const COMMAND_DIALOG = "dialog";
const COMMAND_DELAY = "delay";
const COMMAND_ENTERSTAGE = "enterstage";
const COMMAND_LEAVESTAGE = "leavestage";
const COMMAND_GOTO = "goto";

export default class ScriptPlay extends EventEmitter {
    constructor(script) {
        super();

        script = script || sampleScript;

        this.script = script;
        this.endIndex = script.length;
        this.currentIndex = 0;
    }

    play(game) {
        game.ui.showTheaterScreen(0.5);
            
        this.emit('start');
        // 컷신 준비를 한다
        this.next(game);
    }

    stop() {
        // TODO : 뭐를 해야하지???
    }

    next(game) {
        if (this.currentIndex === this.endIndex) {
            game.ui.hideTheaterScreen(0.5);
            game.currentMode.endCutscene();

            // 컷신을 종료한다
            this.emit('complete');
            return;
        }

        const script = this.script[this.currentIndex];
        ++this.currentIndex;
        if (script.command === COMMAND_DIALOG) {
            // 다이얼로그를 띄운다
            game.ui2.showDialog(script.arguments, () => {
                this.next(game);
            })
        } else if (script.command === COMMAND_DELAY) { 
            const delay = script.arguments[0] * 1000;
            setTimeout(() => {
                this.next(game);
            }, delay);
        } else if (script.command === COMMAND_ENTERSTAGE) {
            const path = "assets/mapdata/" + script.arguments[0] + ".json";
            const options = script.arguments[1];  
            game.enterStage(path, options);
            game.once('stageentercomplete', () => {
                this.next(game);
            });
            
        }  else if (script.command === COMMAND_LEAVESTAGE) {
            const options = script.arguments[0];  
            game.leaveStage(options);
            game.once('stageleavecomplete', () => {
                this.next(game);
            });
        }
        else if (script.command === COMMAND_GOTO) {
            const x = script.arguments[0];  
            const y = script.arguments[1];  

            game.stage.once('moveend', () => { this.next(game); });
            game.stage.moveCharacter(game.currentMode.controller, x, y);
        }
    }


}
