import Tile from './tile';

export default class Gate extends Tile {
    constructor(x, y, tileData) {
        super(x, y, tileData);

        // 철망을 붙인다
        const base = (tileData.direction === "left") ?
                PIXI.Texture.fromFrame("stealBarL.png") : 
                PIXI.Texture.fromFrame("stealBarR.png");

        this.base = base;
        this.bar1 = new PIXI.Sprite(new PIXI.Texture(base, new PIXI.Rectangle(0, 0, base.width, 50)));
        this.bar2 = new PIXI.Sprite(new PIXI.Texture(base, new PIXI.Rectangle(0, 50, base.width, 40)));
        this.bar3 = new PIXI.Sprite(new PIXI.Texture(base, new PIXI.Rectangle(0, 90, base.width, base.height - 90)));
        this.addChild(this.bar1);
        this.addChild(this.bar2);
        this.addChild(this.bar3);

        // 초기값을 설정할 수 있어야 한다
        this.openRatio = 1; // 기본으로 닫아놓는다
        
        // 열쇠로 열수 있는지 확인한다
        if (tileData.tags && tileData.tags.indexOf("key") >= 0) {
            this.needsKey = true;
        }
    }

    set openRatio(value) {
        // 0이면 닫힌거고 1 이면 열린것
        this.bar1.position.y = -this.base.height;
        
        this.bar2.position.y = this.bar1.position.y + this.bar1.height;
        this.bar2.height = value * 40;
        
        this.bar3.position.y = this.bar1.position.y + 50 + this.bar2.height;

        this._openRatio = value;
        this.duration = 0.5;
    }

    open(tweens) {
        if (tweens) {
            // 열쇠가 돌아가는 시간을 조금 벌어야 한다. 바로 열리면 뭔가 이상하다
            tweens.addTween(this, this.duration, { openRatio: 0 }, 0.5, "easeInOut", true);
        } else {
            this.openRatio = 0;
        }
    }

    close(tweens) {
        if (tweens) {
            
            tweens.addTween(this, this.duration, { openRatio: 1 }, 0, "easeInOut", true);
        } else {
            this.openRatio = 1;
        }
    }

    get openRatio() {
        return this._openRatio;
    }

    get isOpened() {
        return this._openRatio <= 0;
    }

    get isInteractive() {
        if (this.isOpened) {
            // 열린문은 인터랙트 하지 않아도 된다
            // 다시 닫을 일이 있을까?
            return false;
        } else {
            return true;
        }
    }

    touch(game) {
        // 다이얼로그를 연다
        if (!this.isOpened) {
            if (this.needsKey) {
                // 열쇠를 가지고 있는지 검사한다
                const keyItem = game.player.inventory.getItemByType(3);
                if (keyItem) {
                    game.ui.showDialog("문을 열었다!");
                    this.open(game.tweens);
                    // 열쇠를 파괴한다
                    game.player.inventory.deleteItem(keyItem.itemId);
                } else {
                    game.ui.showDialog("문을 열기 위해서 열쇠가 필요하다");
                }
                
            } else {
                game.ui.showDialog("이 문은 열리지 않을 것 같다\n\n다른 문을 찾아보자");
            }
        }
    }
    
}   
