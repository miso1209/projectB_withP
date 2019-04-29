import BattleCharacter from "./battlecharacter";
import CharacterFactory from "./characterfactory";
import BattleEffect from "./battleeffect";
import { DIRECTIONS } from "./define";
import MovieClip from './movieclip';
import BattleStage, {BASE_POSITION} from "./battlestage";
import BattleParty from "./battleparty";

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
        console.log(this.skillQueue);
        this.skillQueue.push(skill);
    }

    dequeue() {
        let result = this.skillQueue.shift();
        return result;
    }
}
/*
    기본적으로 전투는 최대 3행 2열 6 vs 6 전투.
    전열, 후열이 존재한다.

    기본적인 targeting은 전열의 적을 먼저 공격 후, 후열을 때리게 구성할 예정.
    따라서 후열에 딜러가 위치할, 위치시킬 가능성이 높다.

    special list들 (ex 궁수)의 경우 후열을 먼저 타격하는 속성을 지닐 수 있겟다. (큰 메리트일 수 있다.)

    주인공의 경우 매우 쓸모없는 능력을 지닌다.
    Passive : 웅크리기 -> 방어력 증가.
    Active : 도망가기 -> 전투가 종료될 때 까지 사라진다.

    TODO: 도트 데미지, 상태이상등을 어떻게 처리할지 생각해보자, 창의적인 스킬 Design및, 캐릭터 확장성 고려할 것.
    6 vs 6 전열, 후열 전투를 생성해야한다. 로직 생각해 볼 것.
    (전열, 후열이라는 좌표계가 생김에 따라 Enemy 직접 타격이 아닌 좌표 타격, 공격이 가능하다.)

    하드코딩 리펙토링 할 수 있는 경우 하고, 디자인좀 잘할것. 아주 난잡하다. 특히 Skill Class
*/
export default class Battle {
    constructor(game) {
        this.game = game;
    }

    prepare() {
        this.activeQueue = new BattleQueue();
        this.basicQueue = new BattleQueue();

        this.stage = new BattleStage("battleMap1.png");
        this.stage.focusMapAbsolutePos({x: 1000}, true, null);
        this.stage.focusCenterPos();
        this.effect = new BattleEffect();
        this.effect.sceneIn(() => {
            this.nextScene = BATTLE_STATUS.INTRO;
        });
        // this.screenEffect = new BattleScreenEffect();

        this.currentAction = null;
        this.nextScene = null;
        this.currentScene = null;
        this.movies = [];

        // 캐릭터 생성하여 배치한다.
        const hectorSpec = CharacterFactory.createCharacterSpec('hector');
        const miludaSpec = CharacterFactory.createCharacterSpec('miluda');
        const elidSpec = CharacterFactory.createCharacterSpec('elid');

        this.playerParty = new BattleParty(
            [new BattleCharacter(hectorSpec), new BattleCharacter(hectorSpec), new BattleCharacter(hectorSpec)],
            [new BattleCharacter(miludaSpec), new BattleCharacter(miludaSpec), new BattleCharacter(miludaSpec)]
        );
        this.playerParty.getCharacters().forEach((character) => {
            character.alpha = 0;
        });

        this.enemyParty = new BattleParty(
            [new BattleCharacter(hectorSpec), new BattleCharacter(hectorSpec), new BattleCharacter(hectorSpec)],
            [new BattleCharacter(elidSpec), new BattleCharacter(elidSpec), new BattleCharacter(elidSpec)]
        );
        this.enemyParty.getCharacters().forEach((character) => {
            character.alpha = 0;
        });

        this.stage.setParty(this.playerParty, BASE_POSITION.PLAYER_X, BASE_POSITION.PLAYER_Y, DIRECTIONS.NE);
        this.stage.setParty(this.enemyParty, BASE_POSITION.ENEMY_X, BASE_POSITION.ENEMY_Y, DIRECTIONS.SW);

        this.stage.addChild(this.effect);
    }

    update() {
        // 기본적으로 stage, 이펙트처리, 캐릭터는 업데이트를 시켜준다
        this.effect.update();
        this.stage.update();

        // 상태에 맞는 씬을 업데이트 시킨다.
        switch (this.nextScene) { 
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
        if (this.currentScene !== this.nextScene) {
            this.currentScene = this.nextScene;
                        
            this.stage.focusMapAbsolutePos({x: 0, y: 0}, false, () => {
                this.setPartyIntro(this.playerParty.getFrontCharacters(), 0, DIRECTIONS.NE, null);
                this.setPartyIntro(this.playerParty.getBackCharacters(), 63, DIRECTIONS.NE, null);
                this.setPartyIntro(this.enemyParty.getFrontCharacters(), 126, DIRECTIONS.SW, null);
                this.setPartyIntro(this.enemyParty.getBackCharacters(), 189, DIRECTIONS.SW, () => {
                    this.nextScene = BATTLE_STATUS.BATTLE;
                });
            });
        }

        this.updateMovieclips();
    }

    updateVictory() {
        this.updateCharacters();

        if (this.currentScene !== this.nextScene) {
            this.currentScene = this.nextScene;

            let gravity = -5;

            const movieClip = new MovieClip(
                MovieClip.Timeline(61, 81, null, () => {
                    this.playerParty.getCharacters().forEach((player) => {
                        player.anim.position.y += gravity;
                    });
                    gravity += 0.5;
                }),
                MovieClip.Timeline(82, 82, null, () => { gravity = -5; }),
                MovieClip.Timeline(91, 111, null, () => {
                    this.playerParty.getCharacters().forEach((player) => {
                        player.anim.position.y += gravity;
                    });
                    gravity += 0.5;
                }),
                MovieClip.Timeline(312, 312, null, () => { this.nextScene = BATTLE_STATUS.OUTRO; })
            );
    
            this.movies.push(movieClip);
            movieClip.playAndStop();
        }

        this.updateMovieclips();
    }

    updateDefeat() {
        this.updateCharacters();

        // 패배했을경우는 뭐.. stage tween으로 붉게 alpha 0.3정도 이펙트 주고, 심플하게 Defeat 위에 뜨고.. 검게 암전 트윈으로 진행한 후 outro진행.
        if (this.currentScene !== this.nextScene) {
            this.currentScene = this.nextScene;

            this.effect.showDefeatScreenEffect(() => {
                this.effect.hideDefeatScreenEffect(() => {
                    this.nextScene = BATTLE_STATUS.OUTRO;
                });
            });
        }
    }

    updateOutro() {
        this.updateCharacters();
        
        // 심플하다 game에서 모드를 변경하며 battle 날린다.
        if (this.currentScene !== this.nextScene) {
            this.currentScene = this.nextScene;

            this.effect.sceneOut(() => {
                this.game.leaveBattle();
            });
        }
    }

    updateBattle() {
        // Battle 종료 시 상태 변경.
        if (this.isBattleEnd() && !this.currentAction) {
            this.nextScene = BATTLE_STATUS.VICTORY;
            return;
        }

        this.updateCharacters();

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
        this.playerParty.getCharacters().forEach((player) => {
            player.update(this);
        });
        this.enemyParty.getCharacters().forEach((enemy) => {
            enemy.update(this);
        });
    }

    updateMovieclips() {
        let len = this.movies.length;
        for (let i = 0; i < len; i++) {
            const movie = this.movies[i];
            movie.update();
            if (!movie._playing) {
                this.movies.splice(i, 1);
                i--; len--;
            }
        }
    }

    setPartyIntro(party, currentFrame, direction, callback) {
        party.forEach((character, index) => {
            const movieClip = new MovieClip(
                MovieClip.Timeline(currentFrame + 1, currentFrame + 20, null, () => {
                    character.alpha += 0.05;
                    character.position.x += direction === DIRECTIONS.NE? 0.3 : -0.3;
                }),
                MovieClip.Timeline(currentFrame + 21, currentFrame + 21, null, () => {
                    character.alpha = 1;

                    if (callback && index === party.length - 1) {
                        callback();
                    }
                })
            );

            movieClip.playAndStop();
            this.movies.push(movieClip);
            currentFrame += 21;
        });
    }

    isBattleEnd() {
        let playerCount = 0;
        this.playerParty.getCharacters().forEach((player) => {
            if (player.stat.hp> 0) {
                playerCount++;
            }
        });

        let enemyCount = 0;
        this.enemyParty.getCharacters().forEach((enemy) => {
            if (enemy.stat.hp> 0) {
                enemyCount++;
            }
        });

        return (enemyCount === 0 || playerCount === 0)? true: false;
    }
}