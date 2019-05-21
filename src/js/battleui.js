import { PROGRESSBAR_STATUS, CHARACTER_CAMP } from "./battledeclare";

// 배틀에 사용된 ui관련된 클래스 작성한다.

export class BattleUi extends PIXI.Container{
    constructor(battle) {
        super();
        const screenSize = {
            w: battle.game.screenWidth,
            h: battle.game.screenHeight
        }
        const offset = {
            x: -20,
            y: -20,
        }

        this.activeUi = new BattlePortraitsContainer(battle);
        this.activeUi.setPosition({
            x: (screenSize.w - this.activeUi.width) + offset.x,
            y: (screenSize.h - this.activeUi.height) + offset.y
        });
        this.addChild(this.activeUi);
    }

    update() {
        this.activeUi.update();
    }
}

export class BattleProgressBar extends PIXI.Container {
    constructor() {
        super();
        this.progressHolder = new PIXI.Sprite(PIXI.Texture.fromFrame("pbar.png"));
        this.progressBar = new PIXI.Sprite(PIXI.Texture.fromFrame("pbar_r.png"));

        this.progressHolder.position.y = -this.progressHolder.height / 2;
        this.progressHolder.position.x = -this.progressHolder.width / 2;
        this.progressBar.position.y = -this.progressBar.height / 2;
        this.progressBar.position.x = -this.progressBar.width / 2;
        
        this.progressBarMaxWidth = this.progressBar.width;
        this.status = PROGRESSBAR_STATUS.DONE;

        this.visible = false;
        this.alpha = 0;
        this.addChild(this.progressHolder);
        this.addChild(this.progressBar);
    }

    setProgress(rate) {
        rate = rate < 0 ? 0 : rate;
        this.progressBar.width = rate * this.progressBarMaxWidth;
    }
    
    setPosition(position) {
        this.position = position;
    }

    setScale(scale) {
        this.scale = scale;
    }

    show() {
        this.visible = true;
        this.alpha = 1;
    }

    hide() {
        this.visible = false;
        this.alpha = 0;
    }
}

class BattlePortraitsContainer extends PIXI.Container {
    constructor(battle) {
        super();
        this.portraits = [];

        const position = {
            x: 0,
            y: 0,
        }

        battle.characters.forEach((character) => {
            if (character && character.camp === CHARACTER_CAMP.ALLY) {
                const portrait = new BattleActivePortraitUi(character);
                portrait.setPosition(position);
                position.x += portrait.width;

                // 이 부분 마음에 안든다.
                portrait.interactive = true;
                portrait.on('mouseup', () => {
                    if (character.skills[1].isReady() && character.health > 0) {
                        character.skills[1].setWait();
                        battle.scene.queue.enqueue(character.skills[1]);
                    }
                });

                this.portraits.push(portrait);
                this.addChild(portrait);
            }
        });
    }

    update() {
        this.portraits.forEach((portrait) => {
            portrait.update();
        });
    }

    setPosition(position) {
        this.position = position;
    }

    show() {
        this.portraits.forEach((portrait) => {
            portrait.visible = true;
            portrait.alpha = 1;
        });
    }

    hide() {
        this.portraits.forEach((portrait) => {
            portrait.visible = false;
            portrait.alpha = 0;
        });
    }
}

class BattleActivePortraitUi extends PIXI.Container {
    constructor(character) {
        super();
        this.character = character;
        this.portrait = new PIXI.Sprite(PIXI.Texture.fromFrame(character.character.data.portrait));
        this.addChild(this.portrait);

        const margin = {
            x: 0,
            y: 6,
        }

        this.healthProgressBar = new BattleProgressBar();
        this.healthProgressBar.setScale({x: 2, y: 2});
        this.healthProgressBar.setPosition({x: this.portrait.width / 2, y: this.height + margin.y});
        this.healthProgressBar.show();
        this.addChild(this.healthProgressBar);

        this.activeProgressBar = new BattleProgressBar();
        this.activeProgressBar.setScale({x: 2, y: 2});
        this.activeProgressBar.setPosition({x: this.portrait.width / 2, y: this.height + margin.y});
        this.activeProgressBar.show();
        this.addChild(this.activeProgressBar);
    }

    update() {
        // 이 부분 마음에 안든다.
        if (this.character.character.health <= 0) {
            this.portrait.tint = 0xFF7777;
        } else if (this.character.skills[1].isReady()) {
            this.portrait.tint = 0xFFFFFF;
        } else {
            this.portrait.tint = 0x555555;
        }

        const healthRate = this.character.character.health / this.character.character.maxHealth;
        this.healthProgressBar.setProgress(healthRate);

        const activeRate = 1 - (this.character.skills[1].currentDelay / this.character.skills[1].coolTime);
        this.activeProgressBar.setProgress(activeRate);
    }

    setScale(scale) {
        this.scale.x = scale.x;
        this.scale.y = scale.y;
    }

    setPosition(position) {
        this.position = position;
    }

    disable() {
        this.portrait.interactive = false;
    }

    enable() {
        this.portrait.interactive = true;
    }
}