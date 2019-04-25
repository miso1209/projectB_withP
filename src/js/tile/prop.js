
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
}