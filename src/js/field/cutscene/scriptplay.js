import EventEmitter from 'events';
import EntranceDoor from './entrace-door';
// 컷신을 스크립트와 시켜서 플레이를 시킨다

// 튜토리얼 컷신을 샘플로 작성해본다
const sampleScript = [
    {
        command: "delay",
        arguments: [0.5],
    }, {
        command: "dialog",
        arguments: ["돈이 없다고 이런곳에서 살아야 하나 ..."]
    }, {
        command: "dialog",
        arguments: ["난 어제 내집에서 잘 수 있을까"]
    }, {
        command: "dialog",
        arguments: ["... 우울해지네"]
    }, {
        command: "dialog",
        arguments: ["아 모르겠다! 일단 작업용 탁자나 찾아보자"]
    },
];

const COMMAND_DIALOG = "dialog";
const COMMAND_DELAY = "delay";
const COMMAND_ENTERSTAGE = "enterstage";
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
        this.next(game);
    }

    next(game) {
        if (this.currentIndex === this.endIndex) {
            // 컷신을 종료한다
            this.emit('complete');
            return;
        }

        const script = this.script[this.currentIndex];
        ++this.currentIndex;
        if (script.command === COMMAND_DIALOG) {
            const text = script.arguments[0];
            // 다이얼로그를 띄운다
            game.ui.showDialog(text, () => {
                this.next(game);
            })
        } else if (script.command === COMMAND_DELAY) { 
            const delay = script.arguments[0] * 1000;
            setTimeout(() => {
                this.next(game);
            }, delay);
        } else if (script.command === COMMAND_ENTERSTAGE) {
            const path = "assets/mapdata/" + script.arguments[0] + ".json";
            const scene = script.arguments[1];  
            const enterance = new EntranceDoor(game, scene.x, scene.y, scene.direction, scene.margin)
            enterance.once('complete', () => { this.next(game); });
            game.enterStage(path, enterance);
        } else if (script.command === COMMAND_GOTO) {
            const x = script.arguments[0];  
            const y = script.arguments[1];  

            game.stage.moveCharacter(game.currentMode.controller, x, y);
        }
    }


}
