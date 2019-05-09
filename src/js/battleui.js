import Tweens from "./tweens";

export default class BattleUi extends PIXI.Container{
    constructor(battle) {
        super();

        this.battle = battle;
        this.battleQueueUi = new BattleQueueUi(battle);

        this.addChild(this.battleQueueUi);
    }

    update() {
        this.battleQueueUi.update();
    }
}

// 캐릭터 하나의 배틀 UI를 담당한다. 이것이 모여 파티 UI를 담당한다. 
class BattleCharacterUi extends PIXI.Container {
    constructor() {
        super();

        // character.portrait
        this.portrait = new PIXI.Sprite(PIXI.Texture.fromFrame());
    }
}

const QUEUE_STATUS = {
    IS_UPDATE: 1,
    DONE: 0
};

// 배틀 큐 예측사항을 보여주는 UI를 담당한다.
class BattleQueueUi extends PIXI.Container {
    constructor(battle) {
        super();
        this.tweens = new Tweens();
        this.battle = battle;
        this.battleQueueSimulator = new BattleQueueSimulator(battle);

        this.activePortraits = [];
        this.passivePortraits = [];
        this.portraitScale = {
            x: 0.25,
            y: 0.25
        };

        // 지금은 각 초상화별 사이즈가 다르다.. 그래서 걍 하드코딩으로 같다고 두고 진행.
        this.portraitSize = 94;

        this.battleQueueSimulator.getCharacters().forEach((character) => {
            this.activePortraits.push(new BattleQueuePortrait(character));
            this.passivePortraits.push(new BattleQueuePortrait(character));
        });
        
        
        this.activePortraits.forEach((portrait) => {
            portrait.alpha = 0;
            portrait.portrait.tint = 0xFFAAAA;
            portrait.blendMode = PIXI.BLEND_MODES.NORMAL;
            this.addChild(portrait);
            portrait.setScale({x: 0.25, y: 0.25});
        });
        this.passivePortraits.forEach((portrait) => {
            portrait.alpha = 0;
            this.addChild(portrait);
            portrait.setScale({x: 0.25, y: 0.25});
        });

        this.status = QUEUE_STATUS.DONE;
    }

    update() {
        this.tweens.update();
        if (this.status === QUEUE_STATUS.DONE) {
            this.status = QUEUE_STATUS.IS_UPDATE;
            this.changePortraitsPosition();
        }
    }

    changePortraitsPosition() {
        this.setPortraitsPriority();

        this.activePortraits.forEach((portrait) => {
            const perWidth = this.portraitSize * this.portraitScale.x;
            // 스타트 지점.
            const position = { y: 80 };

            if (portrait.queuePriority === 0) {
                // 최전방 배치.
                position.x = 40;
            } else if (portrait.queuePriority === -1) {
                // 위로 날린다.
                position.y = -100;
            } else {
                position.x = 80 + perWidth * portrait.queuePriority;
            }

            this.tweens.addTween(portrait.position, 0.2, position, 0, 'easeInOut', false, () => {
                this.status = QUEUE_STATUS.DONE;
            });
        });

        this.passivePortraits.forEach((portrait) => {
            let length = 0;
            const activeQueue = [];
            this.battle.activeQueue.skillQueue.forEach((skill) => {
                if (skill.proponent.stat.hp > 0) {
                    activeQueue.push(skill);
                }
            })
            if (this.battle.currentAction && this.battle.currentAction.activeType === 2) {
                length ++;
            }

            if (this.battle.currentAction && this.battle.currentAction.activeType === 1 && portrait.queuePriority === 0) {
            } else {
                length += activeQueue.length;
            }

            if(portrait.queuePriority !== -1 ) {
                portrait.queuePriority += length;
            }
        });

        this.passivePortraits.forEach((portrait) => {
            const perWidth = this.portraitSize * this.portraitScale.x;
            // 스타트 지점.
            const position = { y: 80 };

            if (portrait.queuePriority === 0) {
                // 최전방 배치.
                position.x = 40;
            } else if (portrait.queuePriority === -1) {
                // 위로 날린다.
                position.y = -100;
            } else {
                position.x = 80 + perWidth * portrait.queuePriority;
            }

            this.tweens.addTween(portrait.position, 0.2, position, 0, 'easeInOut', false, () => {
                this.status = QUEUE_STATUS.DONE;
            });
        });
    }

    showBattleQueue() {
        let perTime = 0.1;

        this.activePortraits.forEach((portrait) => {
            portrait.visible = true;
            this.tweens.addTween(portrait, 0.1, { alpha: 1 }, 0, 'easeInOut', false, () => {
            });
        });

        this.passivePortraits.forEach((portrait) => {
            portrait.visible = true;
            this.tweens.addTween(portrait, perTime * (portrait.queuePriority + 1), { alpha: 1 }, perTime * portrait.queuePriority, 'easeInOut', false, () => {
            });
        });
    }

    hideBattleQueue() {
        let perTime = 0.1;

        this.activePortraits.forEach((portrait) => {
            this.tweens.addTween(portrait, 0.1, { alpha: 0 }, 0, 'easeInOut', false, () => {
                portrait.visible = false;
            });
        });

        this.passivePortraits.forEach((portrait) => {
            this.tweens.addTween(portrait, perTime * (portrait.queuePriority + 1), { alpha: 0 }, perTime * portrait.queuePriority, 'easeInOut', false, () => {
                portrait.visible = false;
            });
        });
    }

    setPortraitsPriority() {
        const simulatedResult = this.battleQueueSimulator.getQueueSimulatedResult();
        const activeQueue = [];

        this.battle.activeQueue.skillQueue.forEach((skill) => {
            if (skill.proponent.stat.hp > 0) {
                activeQueue.push(skill);
            }
        });

        this.activePortraits.forEach((portrait) => {
            if (portrait.character.stat.hp <= 0) {
                portrait.queuePriority = -1;
            } else if (this.battle.currentAction && this.battle.currentAction === portrait.character.skills[1]) {
                portrait.queuePriority = 0;
            } else {
                portrait.queuePriority = activeQueue.indexOf(portrait.character.skills[1]);
                if(activeQueue.indexOf(portrait.character.skills[1]) !== -1) {
                    portrait.queuePriority++;
                }
            }
        });

        this.passivePortraits.forEach((portrait) => {
            portrait.setQueuePriority(simulatedResult);
        });
    }

    setPosition(position) {
        this.position.x = position.x;
        this.position.y = position.y;
    }
}

class BattleQueuePortrait extends PIXI.Container {
    constructor(character) {
        super();
        this.character = character;
        this.portrait = new PIXI.Sprite(PIXI.Texture.fromFrame(character.battleUi.portrait));
        this.addChild(this.portrait);

        this.queuePriority = 0;
    }

    setQueuePriority(simulatedResult) {
        this.queuePriority = simulatedResult.simulatedActionCharacters.indexOf(this.character);
    }

    setScale(scale) {
        this.portrait.scale.x = scale.x;
        this.portrait.scale.y = scale.y;
    }
}

// 배틀 큐에 삽입될 내용을 미리 시뮬레이션 해준다. (큐에 액션이 들어오면 바로 처리하고, 처리할동안 Queue에 액션이 들어오지 않기 때문에. 시뮬레이션 하여 미리 예측 큐를 생성한다.)
class BattleQueueSimulator {
    constructor(battle) {
        this.battle = battle;
    }

    getCharacters() {
        const resultCharacters = [];
        this.battle.playerParty.getCharacters().concat(this.battle.enemyParty.getCharacters()).forEach((character) => {
            if (character.stat.hp > 0) {
                resultCharacters.push(character);
            }
        });
        return resultCharacters;
    }

    getCurrentActionCharacter() {
        if (this.battle.currentAction && this.battle.currentAction.proponent.stat.hp > 0) {
            return this.battle.currentAction.proponent;
        }
        return null;
    }

    getQueueSimulatedResult() {
        // 현재 남아있는 쿨타임 순서대로 정렬시킨다.
        const sortedCharacter = [].concat(this.getCharacters()).sort((prev, next) => {
            if (prev.skills[0].currentDelay > next.skills[0].currentDelay) {
                return 1;
            } else if (prev.skills[0].currentDelay < next.skills[0].currentDelay) {
                return -1;
            } else {
                return 0;
            }
        });

        return {
            currentActionCharacter: this.getCurrentActionCharacter(),
            simulatedActionCharacters: sortedCharacter
        }
    }
}