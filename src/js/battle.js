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

        this.effect.sceneIn(() => {
            this.nextScene = BATTLE_STATUS.INTRO;
        });

        this.currentAction = null;

        this.currentScene = null;
        this.nextScene = null;
        this.movies = [];

        // 캐릭터 생성하여 배치한다.
        const hectorSpec = CharacterFactory.createCharacterSpec('hector');
        const miludaSpec = CharacterFactory.createCharacterSpec('miluda');
        const elidSpec = CharacterFactory.createCharacterSpec('elid');

        this.playerParty = new BattleParty(
            [null, new BattleCharacter(hectorSpec), null],
            [null, new BattleCharacter(miludaSpec), null]
        );
        this.playerParty.getCharacters().forEach((character) => {
            character.alpha = 0;
        });

        this.enemyParty = new BattleParty(
            [null, null, null],
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
        this.effect.update();
        this.stage.update();
        this.updateCharacters();
        this.updateMovieclips();

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
                this.setPartyIntro(this.enemyParty.getFrontCharacters(), 126, DIRECTIONS.SW, () => {
                    this.nextScene = BATTLE_STATUS.BATTLE;
                });
                this.setPartyIntro(this.enemyParty.getBackCharacters(), 189, DIRECTIONS.SW, () => {
                    this.nextScene = BATTLE_STATUS.BATTLE;
                });
            });
        }
    }

    updateBattle() {
        if (this.isBattleEnd() && !this.currentAction) {
            this.nextScene = BATTLE_STATUS.VICTORY;
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

    updateVictory() {
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
                MovieClip.Timeline(112,112, null, () => {
                    // this.playerParty.getCharacters().forEach((player) => {
                    //     this.effect.addFontEffect(player, "EXP 10", "#80FF80", null);
                    // });
                }),
                MovieClip.Timeline(192,192, null, () => {
                    // this.playerParty.getCharacters().forEach((player) => {
                    //     this.effect.addFontEffect(player, "Gold 3", "#FFFF20", null);
                    // });
                }),
                MovieClip.Timeline(312, 312, null, () => { this.nextScene = BATTLE_STATUS.OUTRO; })
            );
    
            this.movies.push(movieClip);
            movieClip.playAndStop();
        }
    }

    updateDefeat() {
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
        if (this.currentScene !== this.nextScene) {
            this.currentScene = this.nextScene;

            this.effect.sceneOut(() => {
                this.game.leaveBattle();
            });
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