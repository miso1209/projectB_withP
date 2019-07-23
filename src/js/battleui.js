import { PROGRESSBAR_STATUS, CHARACTER_CAMP } from "./battledeclare";
import items from './items';
import { EventEmitter } from "events";

// 배틀에 사용된 ui관련된 클래스 작성한다.

export class BattleUI extends EventEmitter {
    constructor(screenSize, characters) {
        super();
        this.tweens = new Tweens();
        this.container = new PIXI.Container();
        this.screenSize = screenSize;

        const offset = {
            x: -20,
            y: -20,
        }

        this.activeUI = new BattlePortraitsContainer(characters);
        this.activeUI.setPosition({
            x: (screenSize.w - this.activeUI.width) + offset.x,
            y: (screenSize.h - this.activeUI.height) + offset.y
        });

        // 초상화 눌렀을 시 이벤트 발생시킨다. 
        this.activeUI.portraits.forEach((portrait) => {
            portrait.interactive = true;
            portrait.on('click', () => {
                if (portrait.character.canAction) {
                    portrait.character.emitExtraSkill();
                }
            });
        });
        this.container.addChild(this.activeUI);
    }

    showBattleLogo(name, hasEffect, callback) {
        const battleLogo = new PIXI.Sprite(PIXI.Texture.fromFrame(name));
        battleLogo.anchor.x = 0.5;
        battleLogo.anchor.y = 0.5;
        battleLogo.position.x = this.screenSize.w + battleLogo.width;
        battleLogo.position.y = this.screenSize.h / 2;
        this.container.addChild(battleLogo);

        // 스케일 up 되면서 사라지는 이펙트가 있는가?
        if (hasEffect) {
            this.tweens.addTween(battleLogo.scale, 0.5, {x: 5, y: 5}, 1.3, 'easeOut', false, null);
        }
        
        this.tweens.addTween(battleLogo.position, 0.5, {x: this.screenSize.w / 2}, 0.5, 'easeOut', false, null);
        this.tweens.addTween(battleLogo, 0.5, {alpha: 0}, 1.3, 'easeOut', false, () => {
            this.container.removeChild(battleLogo);
            callback();
        });
    }

    showReward(reward) {
        if (this.rewardUI) {
            this.container.removeChild(this.rewardUI);
        }

        this.rewardUI = new RewardUI(reward, { width: 980, height: 500 });
        this.rewardUI.closeBtn.interactive = true;
        this.rewardUI.closeBtn.on('click', () => {
            this.hideReward();
            this.emit('closeReward');
        });

        this.container.addChild(this.rewardUI);
    }

    hideReward() {
        this.container.removeChild(this.rewardUI);
        this.rewardUI = null;
    }

    update() {
        this.tweens.update();
        this.activeUI.update();
        if (this.rewardUI) {
            this.rewardUI.update();
        }
    }
}

export class BattleProgressBar extends PIXI.Container {
    constructor() {
        super();
        // this.buffIcon = new BuffIcon({x:4, y:19});
        // this.buffIcon.position.x = -15;
        // this.buffIcon.position.y = -8;
        // this.addChild(this.buffIcon);

        // this.buffIcon = new BuffIcon({x:5, y:19});
        // this.buffIcon.position.x = -5;
        // this.buffIcon.position.y = -8;
        // this.addChild(this.buffIcon);

        // this.buffIcon = new BuffIcon({x:3, y:19});
        // this.buffIcon.position.x = 5;
        // this.buffIcon.position.y = -8;
        // this.addChild(this.buffIcon);

        // this.buffIcon = new BuffIcon({x:2, y:19});
        // this.buffIcon.position.x = 15;
        // this.buffIcon.position.y = -8;
        // this.addChild(this.buffIcon);
        
        this.progressHolder = new PIXI.Sprite(PIXI.Texture.fromFrame("pbar.png"));
        this.progressBar = new PIXI.Sprite(PIXI.Texture.fromFrame("pbar_w.png"));

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

    tinting(tint) {
        this.progressBar.tint = tint;
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
    constructor(characters) {
        super();
        this.portraits = [];

        const position = {
            x: 0,
            y: 0,
        }

        characters.forEach((character) => {
            if (character && character.camp === CHARACTER_CAMP.ALLY) {
                const portrait = new BattleActivePortraitUI(character);
                portrait.setPosition(position);
                position.x += portrait.width;
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

class BattleActivePortraitUI extends PIXI.Container {
    constructor(character) {
        super();
        this.character = character;
        this.portrait = new PIXI.Sprite(PIXI.Texture.fromFrame(character.character.data.battleportrait));
        this.addChild(this.portrait);

        const margin = {
            x: 0,
            y: 6,
        }

        this.healthProgressBar = new BattleProgressBar();
        this.healthProgressBar.setScale({x: 2, y: 2});
        this.healthProgressBar.setPosition({x: this.portrait.width / 2, y: this.height + margin.y});
        this.healthProgressBar.show();
        this.healthProgressBar.tinting('0xAF2A3F');
        this.addChild(this.healthProgressBar);

        this.activeProgressBar = new BattleProgressBar();
        this.activeProgressBar.setScale({x: 2, y: 2});
        this.activeProgressBar.setPosition({x: this.portrait.width / 2, y: this.height + margin.y});
        this.activeProgressBar.show();
        this.activeProgressBar.tinting('0xAF952A');
        this.addChild(this.activeProgressBar);
    }

    update() {
        const healthRate = this.character.character.health / this.character.character.maxHealth;
        this.healthProgressBar.setProgress(healthRate);

        const activeRate = 1 - (this.character.coolTime / this.character.maxCoolTime);
        this.activeProgressBar.setProgress(activeRate);

        if (!this.character.canFight){
            this.portrait.tint = '0xFF9090';
        } else if (activeRate < 1) {
            this.portrait.tint = '0x505050';
        } else {
            this.portrait.tint = '0xffffff';
        }
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

function getText(inputText, options) {
    const style = new PIXI.TextStyle();
    style.fontFamily = 'DungGeunMoFont', 'PixelFont', 'Nanum Gothic', 'Malgun Gothic', '\B9D1\C740   \ACE0\B515', 'AppleSDGothicNeo', 'SF Pro Display', 'Roboto', 'Helvetica Neue', 'sans-serif';
    style.dropShadow = true;
    style.dropShadowDistance = 3;
    style.fontStyle = 'italic';
    style.fontWeight = 'bold';
    style.fontSize = options && options.fontSize?options.fontSize:24;
    style.fill = options && options.fill? options.fill: "#ffffff";

    const text = new PIXI.Text(inputText, style);
    text.anchor.x = 0.5;
    text.anchor.y = 0.5;
    
    return text;
}

class Window extends PIXI.Container {
    constructor(size) {
        super();
        this.container = new PIXI.Container();
        this.windowSprites = [];

        for (let i=1;i<=9;i++) {
            const sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(`nineBox_0${i}.png`));
            this.windowSprites.push(sprite);
            this.container.addChild(sprite);
        }

        this.container.position.x = -this.windowSprites[0].width;
        this.container.position.y = -this.windowSprites[0].height;

        this.text = getText('');

        this.addChild(this.container);
        this.addChild(this.text);
        this.setSize(size);
    }

    changeTitle(inputText, options) {
        this.removeChild(this.text);
        this.text = getText(inputText, options);
        this.text.position.x = this.size.width / 2;
        this.text.position.y = this.text.height / 2;
        this.addChild(this.text);
    }

    setPosition(position) {
        this.position.x = position.x;
        this.position.y = position.y;
    }

    setSize(size) {
        this.size = size;

        this.text.position.x = this.size.width / 2;
        this.text.position.y = this.text.height / 2;

        const position = { x: 0, y: 0 }

        for (let y=0;y<3;y++) {
            for (let x=0;x<3;x++) {
                const idx = y*3+x;
                this.windowSprites[idx].position.x = position.x;
                this.windowSprites[idx].position.y = position.y;

                if (x == 1) {
                    this.windowSprites[idx].width = this.size.width;
                }
                if (y == 1) {
                    this.windowSprites[idx].height = this.size.height;
                }

                position.x += this.windowSprites[idx].width;
            }
            position.x = this.windowSprites[y*3].position.x;
            position.y += this.windowSprites[y*3].height;
        }
    }
}

class RewardUI extends PIXI.Container {
    constructor(reward, screenSize) {
        super();
        // 스크린을 깐다.
        this.blackScreen = new PIXI.Graphics();
        this.blackScreen.beginFill(0x000000);
        this.blackScreen.drawRect(0, 0, screenSize.width, screenSize.height);
        this.blackScreen.endFill();
        this.blackScreen.alpha = 0.7;
        this.addChild(this.blackScreen);

        // 아이템 보상 모달 (상단)
        this.itemRewardContainer = new ItemRewardUI({ width: screenSize.width - 180, height: 170 });
        this.itemRewardContainer.setPosition({ x: 90, y: 60 });
        this.itemRewardContainer.setReward(reward);
        this.itemRewardContainer.changeTitle('- Reward -', { fontSize: 36 });
        this.addChild(this.itemRewardContainer);

        // Close Btn
        this.closeBtn = new PIXI.Sprite(PIXI.Texture.fromFrame('btn_close.png'));
        this.closeBtn.anchor.x = 1;
        this.closeBtn.width = 34;
        this.closeBtn.height = 34;
        this.closeBtn.position.x = this.itemRewardContainer.position.x + this.itemRewardContainer.width - 30;
        this.closeBtn.position.y = this.itemRewardContainer.position.y - 30;
        this.addChild(this.closeBtn);


        // 캐릭터 보상 모달 (하단)
        this.expRewardContainer = [];
        // const marginX = 62.8;
        const marginX = 64;
        const size = {
            width: 80,
            height: 150
        };

        reward.characters.forEach((character, i) => {
            const characterReward = new CharacterRewardUI(size);
            characterReward.setPosition({ x: 90 + (i * (size.width + marginX)), y: 294 });
            characterReward.setCharacter(character, reward.exp);
            this.addChild(characterReward);

            this.expRewardContainer.push(characterReward);
        });
    }

    update() {
        this.itemRewardContainer.update();
        this.expRewardContainer.forEach((rewardContainer) => {
            rewardContainer.update();
        });
    }
}

class CharacterRewardUI extends Window {
    constructor(size) {
        super(size);

        this.tweens = new Tweens();
    }

    setCharacter(character, exp) {
        this.changeTitle(character.displayName, { fontSize: 20 });
        
        const offset = {
            x: -30,
            y: -40
        }

        // 캐릭터 이미지 붙인다.
        const sprite = new PIXI.extras.AnimatedSprite(character.animation.animations.idle_sw.textures);
        sprite.scale.x = sprite.scale.y = 2;
        sprite.anchor.x = sprite.anchor.y = 0.5;
        sprite.position.x = (this.width / 2) + offset.x;
        sprite.position.y = (this.height / 2) + offset.y;
        this.addChild(sprite);


        // EXP 증가량 붙인다.
        this.exp = 0;
        this.tweens.addTween(this, 1, { exp } , 0, 'easeOut', false, null);
        this.expText = getText(`Exp +${exp}`, { fontSize: 18 });
        this.expText.position.x = this.size.width / 2;
        this.expText.position.y = this.size.height - this.expText.height;
        this.addChild(this.expText);

        // 레벨업시 붙인다. ( exp 이미 올려두었는데.. 현재 exp가 오른 exp보다 작다는 것은 레벨업 했다는 것이다.)
        if (character.exp < exp) {
            this.levelUpText = getText(`Level Up!`, { fontSize: 18 });
            this.levelUpText.position.x = this.size.width / 2;
            this.levelUpText.position.y = this.size.height - this.levelUpText.height/2;
            this.levelUpText.alpha = 0;
            this.tweens.addTween(this.expText, 0.5, { y: this.size.height - this.expText.height*2 } , 1, 'easeOut', false, null);
            this.tweens.addTween(this.levelUpText, 0.5, { alpha: 1 } , 1, 'easeOut', false, null);
            this.addChild(this.levelUpText);
        }
    }

    update() {
        this.tweens.update();
        this.expText.text = `Exp +${Math.round(this.exp)}`;
    }
}

class ItemRewardUI extends Window {
    constructor(size) {
        super(size);

        this.tweens = new Tweens();
    }

    setReward(reward) {
        const itemText = getText('Items : ', { fontSize: 30 });
        itemText.anchor.x = 0;
        itemText.position.x = 15;
        itemText.position.y = 150;
        this.addChild(itemText);

        this.gold = 0;
        this.tweens.addTween(this, 2.5, { gold:reward.gold } , 1, 'easeOut', false, null);
        this.goldText = getText(`Gold : ${this.gold}`, { fontSize: 30 });
        this.goldText.anchor.x = 0;
        this.goldText.position.x = 15;
        this.goldText.position.y = 90;
        this.addChild(this.goldText);

        // Item Icons
        let iconPosition = { x: 150, y: 150 };
        let itemAnimDelay = 3.5;
        for(const id in reward.items) {
            const itemIcon = new ItemIcon({ id, ea: reward.items[id] });
            itemIcon.setPosition({ x: iconPosition.x, y: iconPosition.y });
            iconPosition.x += itemIcon.width + 5;
            this.addChild(itemIcon);

            itemIcon.scale.x = 2;
            itemIcon.scale.y = 2;
            itemIcon.alpha = 0;
            this.tweens.addTween(itemIcon, 0.1, { alpha:1 } ,itemAnimDelay, 'linear', false, null);
            this.tweens.addTween(itemIcon.scale, 0.5, { x:1, y:1 } ,itemAnimDelay, 'easeOut', false, null);
            itemAnimDelay += 0.3;
        }
    }

    update() {
        this.tweens.update();
        this.goldText.text = `Gold : ${Math.round(this.gold)}`;
    }
}

class BuffIcon extends PIXI.Container {
    constructor(options) {
        super();
        this.options = options;

        // crop
        const IMAGE_SIZE = 32;
        const baseTexture = PIXI.Texture.fromFrame('bufficons.png');
        const itemtexture = new PIXI.Texture(baseTexture, new PIXI.Rectangle(this.options.x * IMAGE_SIZE, this.options.y * IMAGE_SIZE, IMAGE_SIZE, IMAGE_SIZE));
        this.sprite = new PIXI.Sprite(itemtexture);
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.addChild(this.sprite);
        this.scale.x = 0.3;
        this.scale.y = 0.3;
    }

    setPosition(position) {
        this.position.x = position.x;
        this.position.y = position.y;
    }
}

class ItemIcon extends PIXI.Container {
    constructor(item) {
        super();

        this.ea = item.ea;
        this.item = items[item.id];

        // crop
        const IMAGE_SIZE = 32;
        const baseTexture = PIXI.Texture.fromFrame(this.item.image.texture);
        const itemtexture = new PIXI.Texture(baseTexture, new PIXI.Rectangle(this.item.image.x * IMAGE_SIZE, this.item.image.y * IMAGE_SIZE, IMAGE_SIZE, IMAGE_SIZE));
        this.sprite = new PIXI.Sprite(itemtexture);
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.addChild(this.sprite);

        this.eaText = getText(`x${this.ea}`, { fontSize: 14 });
        this.eaText.position.x = 20;
        this.eaText.position.y = 20;
        this.eaText.anchor.x = 0.5;
        this.eaText.anchor.y = 0.5;
        this.addChild(this.eaText);
    }

    setPosition(position) {
        this.position.x = position.x;
        this.position.y = position.y;
    }
}