// 컷신을 스크립트와 시켜서 플레이를 시킨다

// 튜토리얼 컷신을 샘플로 작성해본다
const sampleScript = [
    {
        command: "delay",
        arguments: [1],
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
    }
];

const COMMAND_DIALOG = "dialog";
const COMMAND_DELAY = "delay";

export default class ScriptPlay {
    constructor(script) {
        script = script || sampleScript;

        this.script = script;
        this.endIndex = script.length;
        this.currentIndex = 0;
    }

    play(game, onComplete) {
        this.onComplete = onComplete || (() =>{});
        this.next(game);
    }

    next(game) {
        if (this.currentIndex === this.endIndex) {
            // 컷신을 종료한다
            this.onComplete();
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
        }
    }


}
