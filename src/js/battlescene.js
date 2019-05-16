import { CHARACTER_CAMP, SKILL_STATUS } from "./battledeclare";
import { Movies, Queue } from "./battleutils";
import MovieClip from "./movieclip";
import Tweens from "./tweens";

export class Scene {
    constructor(battle) {
        this.battle = battle;
        this.movies = new Movies();
        this.tweens = new Tweens();

        if (battle.scene && battle.scene.queue) {
            this.queue = battle.scene.queue;
        } else {
            this.queue = new Queue();
        }
        
        this.init();
    }

    init() {
    }

    update() {
        this.movies.update();
        this.tweens.update();

        this.battle.characters.forEach((character) => {
            character.update(this);
        });

        this.playScene();
    }

    playScene() {
    }
}

export class IntroScene extends Scene {
    constructor(battle) {
        super(battle);
    }

    update() {
        this.movies.update();
        this.tweens.update();

        this.playScene();
    }

    init() {
        // 인트로 동작 타임라인. 암전제거 -> 화면이동 -> 캐릭터 세팅 -> 배틀돌입.
        let characterVisibleFrame = 0;

        const introTimeLine = new MovieClip(
            MovieClip.Timeline(1, 1, null, () => {
                this.battle.sceneEffecter.sceneIn();
            }),
            MovieClip.Timeline(61, 61, null, () => {
                this.battle.stage.setScale({x: 1.2, y: 1.2});
                this.battle.stage.focusCenter();
            }),
            MovieClip.Timeline(141, 141, null, () => {
                this.battle.stage.setCharacters(this.battle.characters);

                this.battle.characters.forEach((character) => {
                    character.container.alpha = 0;
                    character.position.y -= 5;
                    this.tweens.addTween(character.container, 0.2, { alpha: 1 }, characterVisibleFrame, 'easeOut', false, null);
                    this.tweens.addTween(character.position, 0.2, { y: character.position.y + 5 }, characterVisibleFrame, 'easeOut', false, null);
                    characterVisibleFrame += 0.15;
                });
            }),
            MovieClip.Timeline(141 + this.battle.characters.length * 13, 141 + this.battle.characters.length * 13, null, () => {
                // 줌 땡기면서 Battle Start!! Logo 박고 게임 시작하자.
                this.battle.stage.setScale({x: 2, y: 2});
                this.battle.stage.focusCenter();
            }),
            MovieClip.Timeline(201 + this.battle.characters.length * 13, 201 + this.battle.characters.length * 13, null, () => {
                this.battle.changeScene(new BattleScene(this.battle));
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
        this.battle.ui.buildUi();
        this.battle.ui.activeUi.show();
        this.battle.characters.forEach((character) => {
            character.progressBar.show();
        });
    }

    // 싸움 끝나고 큐에있는 동작 하지 않도록 수정하자.
    playScene() {
        const battleStatus = this.getBattleStatus();

        if (this.queue.hasItem() && !(battleStatus.isEnd && this.queue.peak().status === SKILL_STATUS.WAIT)) {
            const action = this.queue.peak();
            action.action(this.battle);
        } else if (battleStatus.isEnd && battleStatus.aliveCamp.ally) {
            this.battle.characters.forEach((character) => {
                character.progressBar.hide();
            });
            this.battle.changeScene(new VictoryScene(this.battle));
        } else if (battleStatus.isEnd && battleStatus.aliveCamp.enemy) {
            this.battle.characters.forEach((character) => {
                character.progressBar.hide();
            });
            this.battle.changeScene(new DefeatScene(this.battle));
        }
    }

    getBattleStatus() {
        const aliveCamp = {
            ally: false,
            enemy: false
        };
        this.battle.characters.forEach((character) => {
            if (character.camp === CHARACTER_CAMP.ALLY && character.health > 0) {
                aliveCamp.ally = true;
            } else if (character.camp === CHARACTER_CAMP.ENEMY && character.health > 0) {
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
        console.log('Outro Scene');
    }

    playScene() {
    }
}

// 빅토리 씬 , 패배씬 생각해 둘 것.
export class VictoryScene extends Scene {
    constructor(battle) {
        super(battle);
        this.battle.ui.activeUi.hide();
        console.log('Victory Scene');
    }

    playScene() {
    }
}

export class DefeatScene extends Scene {
    constructor(battle) {
        super(battle);
        this.battle.ui.activeUi.hide();
        console.log('Defeat Scene');
    }

    playScene() {
    }
}