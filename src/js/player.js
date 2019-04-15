import Character from './character';

function loadAniTexture(name, count) {
    const frames = [];  
    for (let i = 0; i < count; i++) {
        frames.push(PIXI.Texture.fromFrame(name + i + '.png'));
    }
    return frames;
}


// 얘네 다른곳으로 빼야할 듯 하다..
class Knight extends Character {
    constructor() {
        super();
        this.removeChild(this.container);

        // 스프라이트 로드같은것 캐릭터마다 다를테고.. 초상화 같은것도 있을테고.. 음 
        this.name = "Hector";

        // Battle UI
        this.portrait = new PIXI.Sprite(PIXI.Texture.fromFrame("player1_active.png"));
        this.skillAIcon = new PIXI.Sprite(PIXI.Texture.fromFrame("ch03_skill01_on.png"));
        this.skillBIcon = new PIXI.Sprite(PIXI.Texture.fromFrame("ch03_skill02.png"));

        // Stat
        this.hp = 300;
        this.maxHp = 300;
        this.damage = 120;
        this.balance = 0.85;
        this.ciriticalRate = 0.3;
        this.ciriticalBalance = 1.7;
        this.defense = 0.5;
        
        // Animation
        this.animations.idle_nw = { textures: loadAniTexture("idle_nw", 2), flipX: false };
        this.animations.idle_sw = { textures: loadAniTexture("idle_sw", 2), flipX: false };
        this.animations.idle_ne = { textures: this.animations.idle_nw.textures, flipX: true };
        this.animations.idle_se = { textures: this.animations.idle_sw.textures, flipX: true };

        this.animations.walk_nw = { textures: loadAniTexture("walk_nw", 8), flipX: false };
        this.animations.walk_sw = { textures: loadAniTexture("walk_sw", 8), flipX: false };
        this.animations.walk_ne = { textures: this.animations.walk_nw.textures, flipX: true };
        this.animations.walk_se = { textures: this.animations.walk_sw.textures, flipX: true };

        this.animations.attack_nw = { textures: loadAniTexture("atk_nw", 10), flipX: false };
        this.animations.attack_sw = { textures: loadAniTexture("atk_sw", 10), flipX: false };
        this.animations.attack_ne = { textures: this.animations.attack_nw.textures, flipX: true };
        this.animations.attack_se = { textures: this.animations.attack_sw.textures, flipX: true };

        const anim = new PIXI.extras.AnimatedSprite(this.animations.idle_sw.textures);
        anim.animationSpeed = 0.1;
        anim.play();
        anim.position.y = -48; // 하드코딩
        this.anim = anim;
        this.container.addChild(anim);

        // 하드코딩
        this.hpHolder.position.y = -this.anim.height - 8;
        this.hpHolder.position.x = 16 - this.hpHolder.width / 2;
        this.hpBar.position.y = -this.anim.height - 7;
        this.hpBar.position.x = 16 - this.hpHolder.width / 2 + 1;
        
        this.addChild(this.container);
    }
}

export default class Player extends Knight {
    constructor() {
        super();

        this.inventory = new Inventory();
    }
}

class Inventory {
    constructor() {
        this.items = [];
    }

    addItem(itemId, itemType) {
        const item = new Item(itemId, itemType);
        this.items.push(item);
    }

    getItemByType(itemType) {
        for(const item of this.items) {
            if (item.itemType === itemType) {
                return item;
            }
        }
        return null;
    }

    deleteItem(itemId) {
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (item.itemId === itemId) {
                this.items.splice(i, 1);
                return;
            }
        }
    }

    eachItem(callback) {
        for(const item of this.items) {
            callback(item);
        }
    }
}

class Item {
    constructor(itemId, itemType) {
        this.itemId = itemId;
        this.itemType = itemType;
    }
}