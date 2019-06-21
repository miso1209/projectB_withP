export default class PropBase extends PIXI.Container {
    constructor(x, y, options) {
        super();
        this.gridX = x;
        this.gridY = y;

        this.groupId = options.groupId;

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

        this.nameTagOffset = options.nameTagOffset;
        this.movable = options.movable || false;
        this.transperancy = options.transperancy;
        this.flipX = this.flipX;
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
            this.outline.position.x = this.tileTexture.position.x - lineWidth * this.tileTexture.scale.x;
            this.outline.position.y = this.tileTexture.position.y - lineWidth * this.tileTexture.scale.y;
            this.outline.scale.copy(this.tileTexture.scale);
            
            this.addChildAt(this.outline, 0); // 먼저 그려야 한다
        }

        this.outline.visible = true;
    }

    hideOutline() {
        if (this.outline) {
            this.outline.visible = false;
        }       
    }

    showName() {
        if (!this.getName()) { 
            return; 
        }

        if (!this.nametag) {

            const style = new PIXI.TextStyle({fontSize: 1, fill : 0xffffff, align : 'center' });
            const text = new PIXI.Text(this.getName(), style);
            const textMetrics = PIXI.TextMetrics.measureText(this.getName(), style);
            text.anchor.x = 0.5;
            text.anchor.y = 0.5;


            // 배경이 되는 반투명 박스를 만든다
            const box = new PIXI.Sprite(PIXI.Texture.WHITE);
            box.tint = 0;
            box.alpha = 0.3;
            box.anchor.x = 0.5;
            box.anchor.y = 0.5;
            box.width = textMetrics.width + 2;
            box.height = textMetrics.height;

            // TODO : 이미지가 아니라 프랍자체에 붙여야 한다.
            this.nametag = new PIXI.Container();
            this.nametag.addChild(box);
            this.nametag.addChild(text);
            this.nametag.position.x = (this.tileTexture.width / 2) + (this.nameTagOffset?this.nameTagOffset.x:0);
            this.nametag.position.y = -(this.tileTexture.height / 2) + (this.nameTagOffset?this.nameTagOffset.y:0);
            this.addChild(this.nametag);
            this.nametag.visible = false;

            const scale = 1 / 1.5;
            if (this.flipX) {
                this.nametag.scale.set(-scale, scale);
            } else {
                this.nametag.scale.set(scale, scale);
            }
        }

        this.nametag.visible = true;
    }

    hideName() {
        if (this.nametag) {
            this.nametag.visible = false;
        }
    }

    getName() {
        // override 
        return null;
    }

    applyTag(tag) {}
}