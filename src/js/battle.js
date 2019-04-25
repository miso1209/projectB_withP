import BattleCharacter from "./battleCharacter";
import CharacterFactory from "./characterFactory";
import BattleEffect from "./battleEffect";
import { DIRECTIONS } from "./define";
import BattleStage, {BASE_POSITION} from "./battlestage";

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

        this.stage = new BattleStage();
        this.effect = new BattleEffect();

        this.currentAction = null;

        // 캐릭터 생성하여 배치한다.
        const hectorSpec = CharacterFactory.createCharacterSpec('hector');
        const miludaSpec = CharacterFactory.createCharacterSpec('miluda');
        const elidSpec = CharacterFactory.createCharacterSpec('elid');
        this.players = [new BattleCharacter(hectorSpec), new BattleCharacter(miludaSpec), new BattleCharacter(elidSpec)];
        this.enemies = [new BattleCharacter(miludaSpec), new BattleCharacter(elidSpec), new BattleCharacter(hectorSpec)];

        this.setCharacters(this.players, BASE_POSITION.PLAYER_X, BASE_POSITION.PLAYER_Y, DIRECTIONS.NE);
        this.setCharacters(this.enemies, BASE_POSITION.ENEMY_X, BASE_POSITION.ENEMY_Y, DIRECTIONS.SW);

        this.stage.addChild(this.effect);

        this.stage.focusCenterPos();
    }

    start() {
    }

    /*
    battle flow에 대해서 정의해보자.
    BATTLE_FLOW.INTRO     전투 시작
    BATTLE_FLOW.BATTLE    싸운다
    BATTLE_FLOW.VICTORY   승리
    BATTLE_FLOW.DEFEAT    패배
    BATTLE_FLOW.OUTRO     전투 종료
    */
    update() {
        this.effect.update();
        this.stage.update();
        this.updateCharacters();
        
        if (this.isBattleEnd() && !this.currentAction) {
            console.log('end');
            return;
        }

        if (this.currentAction) {
            // 액션 완료되면 action 함수는 NUll 반환하여 currentAction을 null로 만듬.
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

    setCharacters(characters, baseX, baseY, directions) {
        characters.forEach((character, index) => {
            character.position.x = baseX - (characters.length - 1) * 18 + index * 36;
            character.position.y = baseY - (characters.length - 1) * 10 + index * 20;
            character.changeVisualToDirection(directions);
            this.stage.addChild(character);
        });
    }
}