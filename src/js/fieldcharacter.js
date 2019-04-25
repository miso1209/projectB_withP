import { loadAniTexture, getDirectionName } from './utils';
import { DIRECTIONS } from './define';

export default class FieldCharacter extends PIXI.Container {
    constructor(spec) {
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

        if(spec) {
            this.name = spec.name;
            
            for(let key in spec.battleUi) {
                this[key] = new PIXI.Sprite(PIXI.Texture.fromFrame(spec.battleUi[key]));
            }
    
            for(let key in spec.stat) {
                this[key] = spec.stat[key];
            }
    
            for(let key in spec.animations) {
                this.animations[key + '_nw'] = { textures: loadAniTexture(spec.animations[key].texture + "_nw", spec.animations[key].length), flipX: false };
                this.animations[key + '_ne'] = { textures: this.animations[key + '_nw'].textures, flipX: true };
                
                this.animations[key + '_sw'] = { textures: loadAniTexture(spec.animations[key].texture + "_sw", spec.animations[key].length), flipX: false };
                this.animations[key + '_se'] = { textures: this.animations[key + '_sw'].textures, flipX: true };
            }

            this.offset = spec.offset;
        
            const anim = new PIXI.extras.AnimatedSprite(this.animations.idle_sw.textures);
            anim.animationSpeed = 0.1;
            anim.play();
            anim.position.x = this.offset.x;
            anim.position.y = this.offset.y;
            this.anim = anim;
            this.container.addChild(anim);
        }

        this.currentDir = DIRECTIONS.SW;
        this.addChild(this.container);
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