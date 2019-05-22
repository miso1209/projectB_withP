/*import { CHARACTER_CAMP, BATTLE_STATUS, SKILL_STATUS } from "./battledeclare";
import { Queue } from "./battleutils";*/

export class Scene {
    constructor(battle) {
        this.battle = battle;
    }

    update() {
        this.battle.characters.forEach((character) => {
            character.update(this);
        });
    }
}

export class IntroScene extends Scene {
    constructor(battle) {
        super(battle);
        this.battle.stage.setScale({x: 2, y: 2});
        this.battle.stage.focusCenter();
        this.battle.stage.setCharacters(this.battle.characters);
    }

    update() {
        this.battle.changeScene(new BattleScene(this.battle));
    }
}

// Battle Main Logic이다.
export class BattleScene extends Scene {
    constructor(battle) {
        super(battle);

        this.queue = new Queue();

        this.battle.ui.activeUi.show();
        this.battle.characters.forEach((character) => {
            character.progressBar.show();
        });
    }

    update() {
        this.battle.characters.forEach((character) => {
            character.update(this);
        });

        const battleStatus = this.getBattleStatus();
        if (battleStatus === BATTLE_STATUS.WIN) {
            this.battle.changeScene(new VictoryScene(this.battle));
        } else if (battleStatus === BATTLE_STATUS.LOSE) {
            this.battle.changeScene(new DefeatScene(this.battle));
        } else {
            const action = this.queue.peak();
            if (action) {
                action.action(this.battle);
            }
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

        const lastAction = this.queue.peak();
        if (aliveCamp.ally ^ aliveCamp.enemy && lastAction && lastAction.status !== SKILL_STATUS.ACTION) {
            if (aliveCamp.ally) {
                return BATTLE_STATUS.WIN;
            } else {
                return BATTLE_STATUS.LOSE;
            }
        } else {
            return BATTLE_STATUS.DEFAULT;
        }
    }
}

export class OutroScene extends Scene {
    constructor(battle) {
        super(battle);
        console.log('Outro Scene');
    }

    update() {
    }
}

// 빅토리 씬 , 패배씬 생각해 둘 것.
export class VictoryScene extends Scene {
    constructor(battle) {
        super(battle);
        this.battle.ui.activeUi.hide();
        console.log('Victory Scene');
    }

    update() {
    }
}

export class DefeatScene extends Scene {
    constructor(battle) {
        super(battle);
        this.battle.ui.activeUi.hide();
        console.log('Defeat Scene');
    }

    update() {
    }
}