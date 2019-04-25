import BattleCharacter from "./battlecharacter";
import CharacterFactory from "./characterfactory";
import BattleEffect from "./battleeffect";
import { DIRECTIONS } from "./define";
import BattleStage, {BASE_POSITION} from "./battlestage";

const BATTLE_STATUS = {
    INTRO: 1,
    BATTLE: 2,
    VICTORY: 3,
    DEFEAT: 4,
    OUTRO: 5
};

class BattleQueue {
    constructor() {
        this.skillQueue = [];
    }

    hasAction() {
        return this.skillQueue.length > 0;
    }

    enqueue(skill) {
        this.skillQueue.push(skill);
    }

    dequeue() {
        let result = this.skillQueue.shift();
        return result;
    }
}

export default class Battle {
    constructor(game) {
        this.game = game;
    }

    prepare() {
        this.activeQueue = new BattleQueue();
        this.basicQueue = new BattleQueue();

        this.stage = new BattleStage("battleMap1.png");
        this.effect = new BattleEffect();

        this.currentAction = null;
        this.status = BATTLE_STATUS.INTRO;

        // 캐릭터 생성하여 배치한다.
        const hectorSpec = CharacterFactory.createCharacterSpec('hector');
        const miludaSpec = CharacterFactory.createCharacterSpec('miluda');
        const elidSpec = CharacterFactory.createCharacterSpec('elid');
        this.players = [new BattleCharacter(hectorSpec), new BattleCharacter(miludaSpec), new BattleCharacter(elidSpec)];
        this.enemies = [new BattleCharacter(miludaSpec), new BattleCharacter(elidSpec), new BattleCharacter(hectorSpec)];
        this.stage.setCharacters(this.players, BASE_POSITION.PLAYER_X, BASE_POSITION.PLAYER_Y, DIRECTIONS.NE);
        this.stage.setCharacters(this.enemies, BASE_POSITION.ENEMY_X, BASE_POSITION.ENEMY_Y, DIRECTIONS.SW);

        this.stage.addChild(this.effect);
        this.stage.focusCenterPos();
    }

    update() {
        // 기본적으로 stage, 이펙트처리, 캐릭터는 업데이트를 시켜준다
        this.effect.update();
        this.stage.update();
        this.updateCharacters();

        // 상태에 맞는 씬을 업데이트 시킨다.
        switch (this.status) { 
            case BATTLE_STATUS.INTRO :
                this.updateIntro();
                break;
            case BATTLE_STATUS.BATTLE :
                this.updateBattle();
                break;
            case BATTLE_STATUS.VICTORY :
                this.updateVictory();
                break;
            case BATTLE_STATUS.DEFEAT :
                this.updateDefeat();
                break;
            case BATTLE_STATUS.OUTRO :
                this.updateOutro();
                break;
        }
    }

    updateIntro() {
        // 인트로 구성을 어떻게할까..? 캐릭터 하나씩 alpha 0 -> 1 로 부드럽게 나오며, 뒤에서 앞으로 전진하며 순차적으로 캐릭터들 나온 후,
        // 각자 공격모션 두번쯤 취하고 전투 시작? 뭐.. 이건 생각해 봐야겠다.
        console.log('intro');
        this.status = BATTLE_STATUS.BATTLE;
    }

    updateVictory() {
        // 승리시 생각해둔 모션은 Victory 위에 뜨고, 캐릭터들 점프 방방 뛴다. 그 뒤 경험치, 골드등을 머리 위에 표기하고, outro 진행. (전형적인 옛 게임 떠올리면 쉬움.)
        // 어렵지 않을 것 같다. 승리 bgm 도 있으면 좋겠다.
        console.log('victory');
        this.status = BATTLE_STATUS.OUTRO;
    }

    updateDefeat() {
        // 패배했을경우는 뭐.. stage tween으로 붉게 alpha 0.3정도 이펙트 주고, 심플하게 Defeat 위에 뜨고.. 검게 암전 트윈으로 진행한 후 outro진행.
        console.log('defeat');
        this.status = BATTLE_STATUS.OUTRO;
    }

    updateOutro() {
        // 심플하다 game에서 모드를 변경하며 battle 날린다.
    }

    updateBattle() {
        // Battle 종료 시 상태 변경.
        if (this.isBattleEnd() && !this.currentAction) {
            this.status = BATTLE_STATUS.VICTORY;
            return;
        }

        if (this.currentAction) {
            this.currentAction = this.currentAction.action(this);
        } else if (this.activeQueue.hasAction()) {
            this.currentAction = this.activeQueue.dequeue();
            this.currentAction.init(this);
        } else if (this.basicQueue.hasAction()) {
            this.currentAction = this.basicQueue.dequeue();
            this.currentAction.init(this);
        }
    }

    updateCharacters() {
        this.players.forEach((player) => {
            player.update(this);
        });
        this.enemies.forEach((enemy) => {
            enemy.update(this);
        });
    }

    isBattleEnd() {
        let playerCount = 0;
        this.players.forEach((player) => {
            if (player.hp > 0) {
                playerCount++;
            }
        });

        let enemyCount = 0;
        this.enemies.forEach((enemy) => {
            if (enemy.hp > 0) {
                enemyCount++;
            }
        });

        return (enemyCount === 0 || playerCount === 0)? true: false;
    }
}