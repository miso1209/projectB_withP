
export default class Prop extends PIXI.Container {
    constructor(x, y, options) {
        super();
        this.gridX = x;
        this.gridY = y;

        if (options.texture) {

            // 스프라이트 정보를 출력한다
            const texture = options.texture;
            const sprite = new PIXI.Sprite(texture);
            sprite.position.y = -texture.height;
            this.addChild(sprite);
            this.tileTexture = sprite;

            if (options.imageOffset) {
                this.tileTexture.position.x += options.imageOffset.x;
                this.tileTexture.position.y += options.imageOffset.y;
            }
            

            if (options.flipX) {
                sprite.anchor.x = 1;
                sprite.scale.x = -1;
            }
        }

        this.movable = options.movable || false;
        this.transperancy = options.transperancy;
    }

    showOutline() {
        if (!this.outline) {
            const lineWidth = 2;
            const canvas = document.createElement('canvas');
            canvas.width = this.tileTexture.width + lineWidth * 2;
            canvas.height = this.tileTexture.height + lineWidth * 2;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(this.tileTexture.texture.baseTexture.source, 0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = "source-in";
            ctx.fillStyle = "white";
            ctx.fillRect(0,0,canvas.width, canvas.height);
            
            this.outline = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));
            this.outline.visible = false;
            this.outline.position.x = this.tileTexture.position.x - lineWidth;
            this.outline.position.y = this.tileTexture.position.y - lineWidth;
            this.addChildAt(this.outline, 0); // 먼저 그려야 한다
        }

        this.outline.visible = true;
    }

    hideOutline() {
        if (this.outline) {
            this.outline.visible = false;
        }       
    }
}