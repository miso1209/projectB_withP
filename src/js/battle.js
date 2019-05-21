import { BattleStage } from "./battlestage";
import { BattleScreenEffecter } from "./battleeffecter";
import { BattleUi } from "./battleui";
import { IntroScene } from "./battlescene";
import { BattleCharacter } from "./battlecharacter";
import { CHARACTER_CAMP } from "./battledeclare";
import Character from "./character";

// Stage, Effecter, Skill 정리할 것.

export class Battle {
    constructor(game) {
        this.game = game;
    }

    prepare() {
        this.container = new PIXI.Container();

        this.characters = [];
        this.loadBattleCharacter();

        this.stage = new BattleStage({width: this.game.screenWidth, height: this.game.screenHeight});
        this.screenEffecter = new BattleScreenEffecter({width: this.game.screenWidth, height: this.game.screenHeight});
        this.ui = new BattleUi(this);
        this.sceneEffecter = new BattleScreenEffecter({width: this.game.screenWidth, height: this.game.screenHeight});

        this.container.addChild(this.stage);
        this.container.addChild(this.screenEffecter);
        this.container.addChild(this.ui);
        this.container.addChild(this.sceneEffecter);
        
        this.scene = null;
        this.scene = new IntroScene(this);
    }

    loadBattleCharacter() {
        const newBattleCharacter = new BattleCharacter(this.game.player.characters[1]);
        newBattleCharacter.setGridPosition({x:0, y:0});
        newBattleCharacter.setCamp(CHARACTER_CAMP.ALLY);
        this.characters.push(newBattleCharacter);

        const newEnemy = new BattleCharacter(new Character(this.game.charTable.getData(2)));
        newEnemy.setGridPosition({x:0, y:0});
        newEnemy.setCamp(CHARACTER_CAMP.ENEMY);
        this.characters.push(newEnemy);
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