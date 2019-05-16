import { BattleStage } from "./battlestage";
import { BattleScreenEffecter } from "./battleeffecter";
import { BattleUi } from "./battleui";
import { IntroScene } from "./battlescene";
import { BattleCharacter } from "./battlecharacter";
import { CHARACTER_CAMP } from "./battledeclare";
import Character from "./character";

/*
    SceneEffecter : Battle -> expolore, explore -> battle 전환시 암전과 같은 이펙트를 담당 ( UI보다 위에 위치한다. )
    UI : 사용자 GUI
    screenEffect : Screen 타격효과 이펙트( 고정위치로 화면 번쩍임같은 것, UI보다 아래 위치한다. )
    stage : effecter, map, character container등을 포함한 stage
*/

// Dependency 문제있다.. 수정할 것!.. 다른 클래스들도 Dependency 확인하자!.
// Dependenct 관리, 트리 계층구조 짜는것이 아직 덜 익숙한 것 같다.. 계층구도 잘 생각하고 작성할 것!..
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
        this.loadBattleCharacter();
        
        this.scene = null;
        this.scene = new IntroScene(this);
    }

    loadBattleCharacter() {
        const newBattleCharacter = new BattleCharacter(this.game.player.characters[0]);
        newBattleCharacter.setGridPosition({x:0, y:0});
        newBattleCharacter.setCamp(CHARACTER_CAMP.ALLY);
        this.characters.push(newBattleCharacter);

        const newBattleCharacter_1 = new BattleCharacter(this.game.player.characters[1]);
        newBattleCharacter_1.setGridPosition({x:1, y:0});
        newBattleCharacter_1.setCamp(CHARACTER_CAMP.ALLY);
        this.characters.push(newBattleCharacter_1);

        const newBattleCharacter_2 = new BattleCharacter(this.game.player.characters[2]);
        newBattleCharacter_2.setGridPosition({x:0, y:1});
        newBattleCharacter_2.setCamp(CHARACTER_CAMP.ALLY);
        this.characters.push(newBattleCharacter_2);

        const newBattleCharacter_3 = new BattleCharacter(this.game.player.characters[3]);
        newBattleCharacter_3.setGridPosition({x:1, y:1});
        newBattleCharacter_3.setCamp(CHARACTER_CAMP.ALLY);
        this.characters.push(newBattleCharacter_3);

        const newBattleCharacter_4 = new BattleCharacter(this.game.player.characters[4]);
        newBattleCharacter_4.setGridPosition({x:2, y:1});
        newBattleCharacter_4.setCamp(CHARACTER_CAMP.ALLY);
        this.characters.push(newBattleCharacter_4);

        const newEnemy = new BattleCharacter(new Character(this.game.charTable.getData(1)));
        newEnemy.setGridPosition({x:0, y:0});
        newEnemy.setCamp(CHARACTER_CAMP.ENEMY);
        this.characters.push(newEnemy);

        const newEnemy1 = new BattleCharacter(new Character(this.game.charTable.getData(2)));
        newEnemy1.setGridPosition({x:1, y:0});
        newEnemy1.setCamp(CHARACTER_CAMP.ENEMY);
        this.characters.push(newEnemy1);

        const newEnemy2 = new BattleCharacter(new Character(this.game.charTable.getData(3)));
        newEnemy2.setGridPosition({x:0, y:1});
        newEnemy2.setCamp(CHARACTER_CAMP.ENEMY);
        this.characters.push(newEnemy2);

        const newEnemy3 = new BattleCharacter(new Character(this.game.charTable.getData(4)));
        newEnemy3.setGridPosition({x:1, y:1});
        newEnemy3.setCamp(CHARACTER_CAMP.ENEMY);
        this.characters.push(newEnemy3);

        const newEnemy4 = new BattleCharacter(new Character(this.game.charTable.getData(5)));
        newEnemy4.setGridPosition({x:2, y:1});
        newEnemy4.setCamp(CHARACTER_CAMP.ENEMY);
        this.characters.push(newEnemy4);
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