import { CHARACTER_CAMP } from "./battledeclare";
import { Movies, Queue } from "./battleutils";
import  {BattleCharacter}  from "./battlecharacter";
import MovieClip from "./movieclip";
import Tweens from "./tweens";
import CharacterFactory from "./characterfactory";

export class Scene {
    constructor(battle) {
        this.movies = new Movies();
        this.tweens = new Tweens();
        this.queue = new Queue();
        this.battle = battle;
        this.init();
    }

    init() {
    }

    update() {
        this.movies.update();
        this.tweens.update();
        this.playScene();
    }

    playScene() {
    }
}

export class IntroScene extends Scene {
    constructor(battle) {
        super(battle);
    }

    init() {
        const hectorSpec = CharacterFactory.createCharacterSpec('hector');
        const miludaSpec = CharacterFactory.createCharacterSpec('miluda');
        const elidSpec = CharacterFactory.createCharacterSpec('elid');
        const warriorSpec = CharacterFactory.createCharacterSpec('warrior');
        const healerSpec = CharacterFactory.createCharacterSpec('healer');

        // 임시로 하드코딩해서 적과 아군을 만든다.
        const player = new BattleCharacter(hectorSpec);
        player.setCamp(CHARACTER_CAMP.ALLY);
        player.setGridPosition({x: 0, y: 0});
        this.battle.characters.push(player);

        const player2 = new BattleCharacter(warriorSpec);
        player2.setCamp(CHARACTER_CAMP.ALLY);
        player2.setGridPosition({x: 1, y: 0});
        this.battle.characters.push(player2);

        const player3 = new BattleCharacter(miludaSpec);
        player3.setCamp(CHARACTER_CAMP.ALLY);
        player3.setGridPosition({x: 0, y: 1});
        this.battle.characters.push(player3);

        const player4 = new BattleCharacter(elidSpec);
        player4.setCamp(CHARACTER_CAMP.ALLY);
        player4.setGridPosition({x: 1, y: 1});
        this.battle.characters.push(player4);

        const player5 = new BattleCharacter(healerSpec);
        player5.setCamp(CHARACTER_CAMP.ALLY);
        player5.setGridPosition({x: 2, y: 1});
        this.battle.characters.push(player5);

        // ENEMY
        const enemy3 = new BattleCharacter(miludaSpec);
        enemy3.setCamp(CHARACTER_CAMP.ENEMY);
        enemy3.setGridPosition({x: 0, y: 1});
        this.battle.characters.push(enemy3);

        const enemy4 = new BattleCharacter(elidSpec);
        enemy4.setCamp(CHARACTER_CAMP.ENEMY);
        enemy4.setGridPosition({x: 1, y: 1});
        this.battle.characters.push(enemy4);

        const enemy5 = new BattleCharacter(healerSpec);
        enemy5.setCamp(CHARACTER_CAMP.ENEMY);
        enemy5.setGridPosition({x: 2, y: 1});
        this.battle.characters.push(enemy5);

        const enemy = new BattleCharacter(hectorSpec);
        enemy.setCamp(CHARACTER_CAMP.ENEMY);
        enemy.setGridPosition({x: 0, y: 0});
        this.battle.characters.push(enemy);

        const enemy2 = new BattleCharacter(warriorSpec);
        enemy2.setCamp(CHARACTER_CAMP.ENEMY);
        enemy2.setGridPosition({x: 1, y: 0});
        this.battle.characters.push(enemy2);

        // 인트로 동작 타임라인. 암전제거 -> 화면이동 -> 캐릭터 세팅 -> 배틀돌입.
        const introTimeLine = new MovieClip(
            MovieClip.Timeline(1, 1, null, () => {
                this.battle.sceneEffecter.sceneIn();
            }),
            MovieClip.Timeline(61, 61, null, () => {
                this.battle.stage.focusCenter();
            }),
            MovieClip.Timeline(121, 121, null, () => {
                this.battle.stage.setCharacters(this.battle.characters, () => {
                    this.battle.changeScene(new BattleScene(this.battle));
                });
            })
        );

        introTimeLine.playAndStop();
        this.movies.push(introTimeLine);
    }
}

// Battle Main Logic이다.
export class BattleScene extends Scene {
    constructor(battle) {
        super(battle);

        this.activeLength = 0;

        this.battle.ui.buildUi();
    }

    playScene() {
        // // 캐릭터 전부 업데이트.
        const battleStatus = this.getBattleStatus();
        this.battle.characters.forEach((character) => {
            character.update(this);
        });

        // // 액션 실행하고, 액션 완료 시 큐에서 제거한다.
        if (this.queue.hasItem()) {
            const action = this.queue.peak();
            // update에 battle을 준 이유는 스킬에서 effecter에 접근하기 위함.
            const updateResult = action.action(this.battle);

            if(updateResult === null) {
                this.queue.delete(action);
            }
        } else if (battleStatus.isEnd && battleStatus.aliveCamp.ally) {
            this.battle.changeScene(new VictoryScene(this.battle));
        } else if (battleStatus.isEnd && battleStatus.aliveCamp.enemy) {
            this.battle.changeScene(new DefeatScene(this.battle));
        }
    }

    getBattleStatus() {
        const aliveCamp = {
            ally: false,
            enemy: false
        };
        this.battle.characters.forEach((character) => {
            if (character.camp === CHARACTER_CAMP.ALLY && character.baseStat.hp > 0) {
                aliveCamp.ally = true;
            } else if (character.camp === CHARACTER_CAMP.ENEMY && character.baseStat.hp > 0) {
                aliveCamp.enemy = true;
            }
        });

        return {
            isEnd: aliveCamp.ally ^ aliveCamp.enemy,
            aliveCamp
        };
    }
}

export class OutroScene extends Scene {
    constructor(battle) {
        super(battle);
        this.game = battle.game;
    }

    playScene() {
        this.battle.characters.forEach((character) => {
            character.update(this);
        });
    }
}

export class VictoryScene extends Scene {
    constructor(battle) {
        super(battle);
    }

    playScene() {
        this.battle.characters.forEach((character) => {
            character.update(this);
        });
    }
}

export class DefeatScene extends Scene {
    constructor(battle) {
        super(battle);
    }
}