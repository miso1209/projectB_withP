import { DIRECTIONS } from './define';

function loadAniTexture(name, count) {
    const frames = [];  
    for (let i = 0; i < count; i++) {
        frames.push(PIXI.Texture.fromFrame(name + i + '.png'));
    }
    return frames;
}

function getDirectionName(dir) {
    if (dir === DIRECTIONS.SE) {
        return 'se';
    } else if (dir === DIRECTIONS.NW) {
        return 'nw';
    } else if (dir === DIRECTIONS.NE) {
        return 'ne';
    } else if (dir === DIRECTIONS.SW) {
        return 'sw';
    }
}

export default class Character extends PIXI.Container {
    constructor() {
        super();

        this.gridX = 0;
        this.gridY = 0;

        this.status = 'idle';
        this.container = new PIXI.Container();


        // 스프라이트를 읽어와서 애니메이션을 시킨다.
        // 아이들 애니메이션을 읽어온다
        this.animations = {};

        // 그림자를 추가한다
        const shadow = new PIXI.Sprite(PIXI.Texture.fromFrame("shadow.png"));
        shadow.position.y = -shadow.height;
        this.container.addChild(shadow);

        const hpHolder = new PIXI.Sprite(PIXI.Texture.fromFrame("pbar.png"));
        const hpBar = new PIXI.Sprite(PIXI.Texture.fromFrame("pbar_r.png"));

        this.hpHolder = hpHolder;
        this.hpBar = hpBar;
        this.hpHolder.alpha = 0;
        this.hpBar.alpha = 0;

        this.container.addChild(hpHolder);
        this.container.addChild(hpBar);

        this.currentDir = DIRECTIONS.SW;

        this.addChild(this.container);
    }

    setUiVisible(game, flag) {
        const hpWidth = this.hp / this.maxHp * 34;
        this.hpBar.width = hpWidth;

        if (flag) {
            game.tweens.addTween(this.hpHolder, 0.5, { alpha: 1 }, 0, "easeInOut", true);
            game.tweens.addTween(this.hpBar, 0.5, { alpha: 1 }, 0, "easeInOut", true);
        } else {
            game.tweens.addTween(this.hpHolder, 0.5, { alpha: 0 }, 0, "linear", true);
            game.tweens.addTween(this.hpBar, 0.5, { alpha: 0 }, 0, "linear", true);
        }
    }

    onDamage(game, damage, options) {
        this.hp -= damage;
        let hpWidth = (this.hp < 0 ? 0 : this.hp) / this.maxHp * 34;
        if (options.critical) {
            game.whiteScreen.alpha = 0.2;
            game.tweens.addTween(game.whiteScreen, 0.1, { alpha: 0 }, 0, "easeInOut", true);
            game.stage.vibrateObj(game.stage.mapContainer, 6, null);
        }
        // Effect 작성해보자.
        // 여기 메모리 낭비.. 계속 addChild로 animated sprite 박고 있어서 문제가 될 듯하다. 어떻게 해야할까..
        // 심지어 이펙트 쪽으로 빼야할듯..
        // 이것을 빼면서.. Character 내부에 뜨는 Damage 도 다른 Container에 생성해야할듯싶다..
        const slash = { textures: loadAniTexture("slash_", 8), flipX: false };
        const anim = new PIXI.extras.AnimatedSprite(slash.textures);
        anim.animationSpeed = 0.5;
        anim.loop = false;
        anim.blendMode = PIXI.BLEND_MODES.ADD;
        anim.play();
        anim.position.y = -anim.height;
        anim.position.x = -anim.width / 4;
        this.container.addChild(anim);

        // UI에서 데미지 받았을때 처리.
        game.ui.battleUi.updateStatus(this);

        game.tweens.addTween(this.hpBar, 0.5, { width: hpWidth }, 0, "easeInOut", true);
        game.stage.vibrateObj(this.anim, 4, () => { this.checkDie(); });
    }

    checkDie() {
        // tween으로 작성할것...
        var func = () => {
            setTimeout(() => {
                if (this.container.alpha >= 0.1) {
                    this.container.alpha -= 0.1;
                    func();
                } else {
                    this.container.alpha = 0;
                }
            }, 20);
        };

        if (this.hp <= 0) {
            this.status = 'die';
            func();
        }
    }

   
    setAnimation(name) {
        const ani = this.animations[name];
        if (ani && this.anim.name !== name) {
            this.anim.name = name;
            this.anim.textures = ani.textures;
            this.anim.scale.x = ani.flipX ? -1 : 1;
            this.anim.position.x = ani.flipX ? this.anim.width : 0;
            this.anim.gotoAndPlay(0);

        }
    }

    changeVisualToDirection(direction) {
        this.currentDir = direction;
        if (this.isMoving) {
            // 이동 애니메이션
            this.setAnimation('walk_' + getDirectionName(direction));
        } else {
            this.setAnimation('idle_' + getDirectionName(direction));
        }
    }    
}