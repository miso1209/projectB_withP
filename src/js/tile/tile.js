const TILE_WIDTH  = 32;
const TILE_HEIGHT = 16;

export default class Tile extends PIXI.Container {
    constructor(x, y, options) {
        super();
        this.gridX = x;
        this.gridY = y;

        // 스프라이트 정보를 출력한다
        const texture = options.texture;
        const sprite = new PIXI.Sprite(texture);
        sprite.position.y = -texture.height;
        this.addChild(sprite);
        this.tileTexture = sprite;

        // 타일 영역에 대한 버텍스를 만든다
        const vertices = [
            [0, -TILE_HEIGHT/2],
            [TILE_WIDTH/2, -TILE_HEIGHT],
            [TILE_WIDTH, -TILE_HEIGHT/2],
            [TILE_WIDTH/2, 0]
        ];
        this.vertices = vertices;

        // 하이라이트를 만든다
        // TODO : 모든 타일에 대해서 하이라이트를 만들 필요가 있을까? 바닥타일만 하이라이트를 만들고 싶다
        this.highlightedOverlay = new PIXI.Graphics();
        this.highlightedOverlay.clear();
        this.highlightedOverlay.lineStyle(2, 0xFFFFFF, 1);
        this.highlightedOverlay.beginFill(0x80d7ff, 0.5);
        this.highlightedOverlay.moveTo(vertices[0][0], vertices[0][1]);
        for (let i = 1; i < vertices.length; i++)
        {
            this.highlightedOverlay.lineTo(vertices[i][0], vertices[i][1]);
        }
        this.highlightedOverlay.lineTo(vertices[0][0], vertices[0][1]);
        this.highlightedOverlay.endFill();
        this.addChild(this.highlightedOverlay);

        this.highlightedOverlay.visible = false;
        this.isHighlighted = false;
        
        this.movable = options.movable || false;
        this.transperancy = options.transperancy;

        this.isGroundTile = options.objectType === "tiles";
    }

    setTexture(texture) {
        this.tileTexture.texture = texture;
        this.tileTexture.position.y = -texture.height;
    } 

    // 어떻게 해야하냐.. 고민고민
    setObject(object) {
        this.addChild(object);
    }

    removeObject(object) {
        this.removeChild(object);
    }

    setHighlighted(isHighlighted) {

        if (this.isHighlighted !== isHighlighted)
        {
            this.highlightedOverlay.visible = isHighlighted;
            this.isHighlighted = isHighlighted;
        }
    }
}