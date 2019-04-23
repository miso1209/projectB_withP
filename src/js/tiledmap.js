
export default class TileSet {

    constructor(data) {
        this.create(data);
    }

    create(mapData) {

        // 실제로 90도를 회전시켜야 하기 때문에 width/height 를 뒤바꾼다
        this.width = mapData.height;
        this.height = mapData.width;
        const baseTileWidth = 32;
        const baseTileHeight = 16;

        // 타일셋을 먼저 등록한다
        const tileset = {};
        
        for (const _tileset of mapData.tilesets) {

            const firstgid = _tileset.firstgid;
            const tileoffset = _tileset.tileoffset || { x: 0, y: 0 };

            if (_tileset.image) {
                const margin = _tileset.margin;
                const tileWidth = _tileset.tilewidth;
                const tileHeight = _tileset.tileheight;
                const spacing = _tileset.spacing;
                
                const baseTexture = PIXI.Texture.fromFrame(_tileset.image);
                baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
                
                for (let i = 0; i < _tileset.tilecount; ++i) {
                    const tileInfo = {};
                    tileInfo.id = i + firstgid;
                    
                    const x = i % _tileset.columns;
                    const y = Math.floor(i / _tileset.columns);
    
                    const xOffset = margin + (tileWidth + spacing) * x;
                    const yOffset = margin + (tileHeight + spacing) * y;
                    tileInfo.texture = new PIXI.Texture(baseTexture, new PIXI.Rectangle(xOffset, yOffset, tileWidth, tileHeight));
                    tileset[tileInfo.id] = tileInfo;

                    // 타일셋 정보를 추가한다
                    tileInfo.xsize = (tileWidth - (-tileoffset.x + baseTileWidth)) / (baseTileWidth/2) + 1;
                    tileInfo.ysize = -tileoffset.x / (baseTileWidth/2) + 1;
                }
            } 
            
            for (const src of (_tileset.tiles || [])) {
                const dstId = src.id + firstgid;
                const dst = tileset[dstId] = tileset[dstId] || { id: dstId };
                
 
                // 기본 타입을 복사
                dst.type = src.type;
                

                // 타일 전용 이미지가 있는지?
                if (src.image) {
                    dst.texture = PIXI.Texture.fromFrame(src.image);
                    
                    // 타일셋 정보를 추가한다
                    dst.xsize = (src.imagewidth - (-tileoffset.x + baseTileWidth)) / (baseTileWidth/2) + 1;
                    dst.ysize = -tileoffset.x / (baseTileWidth/2) + 1;
                }

                // 애니메이션 정보 복사
                dst.animations = src.animation || [];
                for(const anim of dst.animations) {
                    // 애니메이션 정보를 어떻게 처리해야할까?
                    anim.texture = tileset[anim.tileid + firstgid].texture;
                }
                    
                // 커스텀 프라퍼티 복사
                for( const property of src.properties || []) {
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
                    let tileId = layer.data[srcIndex];

                    if (tileId !== 0) {
                        // flip 여부를 찾는다
                        const flipX = !!(tileId & 0x80000000);
                        tileId = tileId &0x0FFFFFFF;
                        
                        const instance = {};
                        Object.assign(instance, tileset[tileId]);
                        instance.flipX = flipX;

                        const xsize = instance.flipX ? instance.ysize : instance.xsize;
                        const ysize = instance.flipX ? instance.xsize : instance.ysize;
                        
                        if (ysize > 1) {
                            // 오프셋을 정한다 
                            instance.imageOffset = {
                                x: -(ysize - 1) * mapData.tilewidth / 2 ,
                                y: 0,
                            };
                        }

                        // 그룹을 세팅한다
                        for(let j = 0; j < ysize; ++j ) {
                            for(let i = 0; i < xsize; ++i ) {
                                if (i === 0 && j === 0) { continue; }

                                // 타일의 데이터를 추가로 변경한다
                                const gindex = (x + i) + (y - j) * this.width;
                                tiledata[gindex] = tiledata[gindex] || [];

                                // 서브타일 정보를 생각한다
                                const subtile = {};
                                Object.assign(subtile,  instance);
                                subtile.texture = null;
                                tiledata[gindex].push(subtile);
                            }
                        }

                        // 타일이 배열로 들어가게 된다. 배열의 순서는 드로잉 순서이기 때문에 매우 중요하다
                        tiledata[dstIndex] = tiledata[dstIndex] || [];
                        tiledata[dstIndex].push(instance);
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
}