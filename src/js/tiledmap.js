
export default class TileSet {

    constructor(data) {
        this.create(data);
    }

    create(mapData) {

        // 실제로 90도를 회전시켜야 하기 때문에 width/height 를 뒤바꾼다
        this.width = mapData.height;
        this.height = mapData.width;

        // 타일셋을 먼저 등록한다
        const tileset = {};
        for (const _tileset of mapData.tilesets) {

            const margin = _tileset.margin;
            const tileWidth = _tileset.tilewidth;
            const tileHeight = _tileset.tileheight;
            const spacing = _tileset.spacing;
            const firstgid = _tileset.firstgid;

            const baseTexture = new PIXI.BaseTexture(_tileset.image, { scaleMode: PIXI.SCALE_MODES.NEAREST });
            
            for (let i = 0; i < _tileset.tilecount; ++i) {
                const tileInfo = {};
                tileInfo.id = i + firstgid;
                tileInfo.objectType = _tileset.name;
                
                const x = i % _tileset.columns;
                const y = Math.floor(i / _tileset.columns);

                const xOffset = margin + (tileWidth + spacing) * x;
                const yOffset = margin + (tileHeight + spacing) * y;
                tileInfo.texture = new PIXI.Texture(baseTexture, new PIXI.Rectangle(xOffset, yOffset, tileWidth, tileHeight));

                tileset[tileInfo.id] = tileInfo;
            }

                        
            for (const src of (_tileset.tiles || [])) {
                const dst = tileset[src.id + firstgid];
                // 애니메이션 정보 복사
                dst.animations = src.animation || [];
                for(const anim of dst.animations) {
                    // 애니메이션 정보를 어떻게 처리해야할까?
                    anim.texture = tileset[anim.tileid + firstgid].texture;
                }
                    
                // 커스텀 프라퍼티 복사
                for( const property of src.properties) {
                    dst[property.name] = property.value;
                }
            }
        }

        const tiledata = new Array(this.width * this.height);

        // 그라운드 타일과 오브젝트 타일을 구분한다
        for (const layer of mapData.layers) {
            if (mapData.width !== layer.width || mapData.height !== layer.height) {
                throw new Error("map 과 layer 의 크기는 항상 일치하여야 합니다");
            }
            
            for (let y = 0; y < this.height;++y) {
                for (let x = 0; x < this.width;++x) {
                    // 맵툴문제 때문에 90 도를 뒤집어야 한다
                    const dstIndex = x + y * this.width;
                    const srcIndex =  y + (layer.width - x -1) * layer.width;
                    const tileId = layer.data[srcIndex];

                    if (tileId !== 0) {
                        // 타일이 배열로 들어가게 된다. 배열의 순서는 드로잉 순서이기 때문에 매우 중요하다
                        tiledata[dstIndex] = tiledata[dstIndex] || [];
                        tiledata[dstIndex].push(tileId);
                    }
                }
            }
        }

        // 타일데이터와 타일 셋 정보를 클래스에 기록한다
        this.tileset = tileset;
        this.tiledata = tiledata;
    }

    getTilesAt(x, y) {
        const i = x + y * this.width;
        return this.tiledata[i] || [];
    }

    getTile(tileId) {
        return this.tileset[tileId];
    }
}