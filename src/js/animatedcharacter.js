import { loadAniTexture, getDirectionName } from './utils';
import { DIRECTIONS } from './define';
import characters from './characters';

function getAnimationKeys(data) {
    const keys = {};
    const result = [];

    for (const animationName in data.animations) {
        const key = animationName.replace(data.name + '_', '').replace('_nw', '').replace('_ne', '').replace('_sw', '').replace('_se', '');
        if (!keys[key])  {
            keys[key] = true;
            result.push(key);
        }
    }

    return result;
}

export default class AnimatedCharacter extends PIXI.Container {
    constructor(id) {
        super();

        const data = characters[id];

        this.gridX = 0;
        this.gridY = 0;

        this.status = 'idle';
        this.container = new PIXI.Container();
        this.addChild(this.container);

        // 스프라이트를 읽어와서 애니메이션을 시킨다.
        // 아이들 애니메이션을 읽어온다
        this.animations = {};

        // 그림자를 추가한다
        const shadow = new PIXI.Sprite(PIXI.Texture.fromFrame("shadow.png"));
        shadow.position.y = -shadow.height;
        this.container.addChild(shadow);

        // 모든 필드 캐릭터는 동일한 데이터를 사용한다
        for(let key of getAnimationKeys(data)) {
            const keyA = data.name + "_" + key + "_nw";
            this.animations[key + '_nw'] = { textures: loadAniTexture(keyA, data.animations[keyA].length), flipX: false };
            this.animations[key + '_ne'] = { textures: this.animations[key + '_nw'].textures, flipX: true };
            

            const keyB = data.name + "_" + key + "_sw";
            this.animations[key + '_sw'] = { textures: loadAniTexture(keyB, data.animations[keyB].length), flipX: false };
            this.animations[key + '_se'] = { textures: this.animations[key + '_sw'].textures, flipX: true };
        }

        this.offset = data.offset;
    
        const anim = new PIXI.extras.AnimatedSprite(this.animations.idle_sw.textures);

        // TODO : 애니메이션 스피드를 어디엔가 적어놔야 한다
        anim.animationSpeed = 0.2;
        anim.play();
        anim.position.x = this.offset.x;
        anim.position.y = this.offset.y;
        
        this.anim = anim;
        this.container.addChild(anim);
        this.currentDir = DIRECTIONS.SW;

        // 트윈
        this.tweens = new Tweens();
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

    animate(name, isLoop) {
        this.setAnimation(name + '_' + getDirectionName(this.currentDir));
        this.anim.isLoop = isLoop;
    }

    update() {
        this.tweens.update();
    }

    colorBlink(color, duration) {
        this.tintR = (color & 0xFF0000) >> 16;
        this.tintG = (color & 0x00FF00) >> 8;
        this.tintB = (color & 0x0000FF);
        
        this.tweens.addTween(this, duration, {tintR: 255, tintG: 255, tintB: 255}, 0, 'linear', false, null);
    }

    get tintR() {
        return (this.anim.tint & 0xFF0000) >> 16;
    }

    get tintG() {
        return (this.anim.tint & 0x00FF00) >> 8;
    }

    get tintB() {
        return this.anim.tint & 0x0000FF;
    }

    set tintR(r) {
        this.anim.tint = (this.anim.tint & 0x00FFFF) | (r << 16);
    }

    set tintG(g) {
        this.anim.tint = (this.anim.tint & 0xFF00FF) | (g << 8);
    }

    set tintB(b) {
        this.anim.tint = (this.anim.tint & 0xFFFF00) | (b);
    }

    // 캐릭터 anim의 position 건드리는데.. anim x 건드리는 애랑 같이 사용할 경우 문제될 수 있다.
    vibration(scale, duration) {
        // 캐릭터는 container 에 의해서 흔들린다
        this.container.position.x = scale;
        this.container.position.y = scale;
        this.tweens.addTween(this.container.position, duration, {x: 0, y: 0}, 0, 'outBounce', true);
    }
}