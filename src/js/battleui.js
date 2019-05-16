import { PROGRESSBAR_STATUS, CHARACTER_CAMP } from "./battledeclare";
import Tweens from "./tweens";

// 배틀에 사용된 ui관련된 클래스 작성한다.

export class BattleProgressBar extends PIXI.Container {
    constructor(skin) {
        super();
        this.container = new PIXI.Container();
        this.tweens = new Tweens();
        const hpHolder = new PIXI.Sprite(PIXI.Texture.fromFrame("pbar.png"));
        const hpBar = new PIXI.Sprite(PIXI.Texture.fromFrame(skin?skin:"pbar_r.png"));
        this.healthHolder = hpHolder;
        this.healthBar = hpBar;
        this.healthHolder.position.y = -3;
        this.healthHolder.position.x = 16 - this.healthHolder.width / 2;
        this.healthBar.position.y = -2;
        this.healthBar.position.x = 16 - this.healthHolder.width / 2 + 1;
        this.container.addChild(hpHolder);
        this.container.addChild(hpBar);
        this.addChild(this.container);
        this.width = 34;
        this.status = PROGRESSBAR_STATUS.DONE;
        this.container.visible = false;
        this.container.alpha = 0;
    }

    update() {
        this.tweens.update();
    }

    setWidth(width) {
        if (this.healthBar.width.toFixed(2) !== width.toFixed(2) && this.status === PROGRESSBAR_STATUS.DONE) {
            this.status = PROGRESSBAR_STATUS.IS_UPDATE;

            this.tweens.addTween(this.healthBar, 0.2, { width: width }, 0, 'easeInOut', false, () => {
                this.status = PROGRESSBAR_STATUS.DONE;
            });
        }
    }
    
    setPosition(position) {
        this.position = position;
    }

    setScale(scale) {
        this.scale = scale;
    }

    show() {
        this.container.visible = true;
        this.tweens.addTween(this.container, 0.5, { alpha: 1 }, 0, 'easeInOut', false, () => {
        });
    }

    hide() {
        this.tweens.addTween(this.container, 0.5, { alpha: 0 }, 0, 'easeInOut', false, () => {
            this.container.visible = false;
        });
    }
}

export class BattleUi extends PIXI.Container{
    constructor(battle) {
        super();

        this.activeUi = new BattlePartyActiveUi(battle);
        this.activeUi.setPosition({x: 350, y: 370});
        this.addChild(this.activeUi);
    }

    // 아직 어렵다.
    buildUi() {
        this.activeUi.makePortrait();
    }

    update() {
        this.activeUi.update();
    }
}

class BattlePartyActiveUi extends PIXI.Container {
    constructor(battle) {
        super();
        this.battle = battle;
        this.tweens = new Tweens();
        this.portraits = [];
    }

    update() {
        this.tweens.update();

        this.portraits.forEach((portrait) => {
            portrait.update();
        });
    }

    makePortrait() {
        const portraitSize = 104;
        const position = {
            x: 0,
            y: 0,
        }

        this.battle.characters.forEach((character) => {
            if (character && character.camp === CHARACTER_CAMP.ALLY) {
                position.x += portraitSize;
                const portrait = new BattleActivePortraitUi(character);
                portrait.interactive = true;
                portrait.on('mouseup', () => {
                    if (character.skills[1].isReady() && character.health > 0) {
                        character.skills[1].setWait();
                        this.battle.scene.queue.enqueue(character.skills[1]);
                    }
                });
                portrait.setPosition(position);
                this.portraits.push(portrait);
                this.addChild(portrait);
            }
        });

        this.setPosition({
            x: 850 - this.width,
            y: this.position.y
        });

        this.portraits.forEach((portrait) => {
            portrait.alpha = 0;
            portrait.visible = false;
        });
    }

    setPosition(position) {
        this.position = position;
    }

    show() {
        this.portraits.forEach((portrait) => {
            portrait.visible = true;
            this.tweens.addTween(portrait, 0.5, { alpha: 1 }, 0, 'easeInOut', false, () => {
            });
        });
    }

    hide() {
        this.portraits.forEach((portrait) => {
            this.tweens.addTween(portrait, 0.5, { alpha: 0 }, 0, 'easeInOut', false, () => {
                portrait.visible = false;
            });
        });
    }
}

class BattleActivePortraitUi extends PIXI.Container {
    constructor(character) {
        super();
        this.character = character;
        this.portrait = new PIXI.Sprite(PIXI.Texture.fromFrame(character.character.data.portrait));
        this.addChild(this.portrait);

        this.healthProgressBar = new BattleProgressBar();
        this.healthProgressBar.setScale({x: 2, y: 2});
        this.healthProgressBar.setPosition({x: 13, y: 98});
        this.healthProgressBar.show();
        this.addChild(this.healthProgressBar);

        this.activeProgressBar = new BattleProgressBar("pbar_o.png");
        this.activeProgressBar.setScale({x: 2, y: 2});
        this.activeProgressBar.setPosition({x: 13, y: 110});
        this.activeProgressBar.show();
        this.addChild(this.activeProgressBar);
    }

    update() {
        if (this.character.character.health <= 0) {
            this.portrait.tint = 0xFF7777;
        } else if (this.character.skills[1].isReady()) {
            this.portrait.tint = 0xFFFFFF;
        } else {
            this.portrait.tint = 0x555555;
        }

        const hpWidth = (this.character.character.health< 0 ? 0 : this.character.character.health) / this.character.character.maxHealth * 34;
        this.healthProgressBar.setWidth(hpWidth);

        const activeWidth = (this.character.skills[1].coolTime - (this.character.skills[1].currentDelay< 0 ? 0 : this.character.skills[1].currentDelay)) / this.character.skills[1].coolTime * 34;
        this.activeProgressBar.setWidth(activeWidth);

        this.healthProgressBar.update();
        this.activeProgressBar.update();
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