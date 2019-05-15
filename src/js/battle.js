import { BattleStage } from "./battlestage";
import { BattleScreenEffecter } from "./battleeffecter";
import { BattleUi } from "./battleui";
import { IntroScene } from "./battlescene";

/*
    SceneEffecter : Battle -> expolore, explore -> battle 전환시 암전과 같은 이펙트를 담당 ( UI보다 위에 위치한다. )
    UI : 사용자 GUI
    screenEffect : Screen 타격효과 이펙트( 고정위치로 화면 번쩍임같은 것, UI보다 아래 위치한다. )
    stage : effecter, map, character container등을 포함한 stage
*/

export class Battle {
    constructor(game) {
        this.game = game;
    }

    prepare() {
        // 실질적 화면
        this.container = new PIXI.Container();

        // 배틀에 사용되는 요소
        this.screenEffecter = new BattleScreenEffecter();
        this.ui = new BattleUi(this);
        this.stage = new BattleStage();
        this.sceneEffecter = new BattleScreenEffecter();

        this.container.addChild(this.stage);
        this.container.addChild(this.screenEffecter);
        this.container.addChild(this.ui);
        this.container.addChild(this.sceneEffecter);

        // 캐릭터에 좌표 가지고, 진영을 가지자.
        this.characters = [];

        this.scene = new IntroScene(this);
    }
    
    update() {
        // default container update
        this.stage.update();
        this.screenEffecter.update();
        this.ui.update();
        this.sceneEffecter.update();

        // Scene update
        this.scene.update();
    }

    changeScene(scene) {
        this.scene = scene;
    }
}