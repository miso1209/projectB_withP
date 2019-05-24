export default class TiledMap {

    constructor(data) {
        this.create(data);
    }

    create(mapData) {

        // 실제로 90도를 회전시켜야 하기 때문에 width/height 를 뒤바꾼다
        this.width = mapData.height;
        this.height = mapData.width;

        this.tileWidth = mapData.tilewidth;
        this.tileHeight = mapData.tileheight;

        // 타일셋을 먼저 등록한다
        const tileset = this.createTileSet(mapData);
        const groups = [];

        let nextGroupId = 0;
        for (const _layer of mapData.layers) {
            // 레이어그룹을 만든다
            const group = { 
                name: _layer.name,
                layers: [],
            };
            groups.push(group);
            
            const layers = _layer.type === "group" ? _layer.layers : [ _layer ];
            for(const layer of layers) {
                if (this.width !== layer.width || this.height !== layer.height) {
                    throw new Error("map 과 layer 의 크기는 항상 일치하여야 합니다");
                }
                
                const target = new Array(this.width * this.height);
                group.layers.push(target)

                for (let index = 0; index < layer.data.length; ++index) {
                    const tileId = layer.data[index];
                    if (tileId === 0) { continue; }

                    const instance = {};
                    instance.tileId = tileId &0x0FFFFFFF;
                    instance.groupId = ++nextGroupId;

                    Object.assign(instance, tileset[instance.tileId]);
                    
                    instance.flipX = !!(tileId & 0x80000000);
                    instance.xsize = instance.xsize || 1;
                    instance.ysize = instance.ysize || 1;
                    
                    if (instance.flipX) {
                        // x 와 y 를 바꾼다
                        const temp = instance.xsize;
                        instance.xsize = instance.ysize;
                        instance.ysize = temp;
                    }

                    if (instance.ysize > 1) {
                        // 오프셋을 정한다 
                        instance.imageOffset = {
                            x: -(instance.ysize - 1) * mapData.tilewidth / 2 ,
                            y: 0,
                        };
                    }
                    
                    target[index] = instance;
                }
            }
        }

        // 타일데이터와 타일 셋 정보를 클래스에 기록한다
        this.tileset = tileset;
        this.groups = groups;
    }

    createTileSet(data) {
        const baseTileWidth = data.tilewidth;
        const tileset = {};
        for (const _tileset of data.tilesets) {

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
        return tileset;
    }
}