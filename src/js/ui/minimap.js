const TILE_WIDTH = 32;
const TILE_HEIGHT = 16;
const MAP_DATA = {
    '   ': null,
    ' ▨ ': 'event_02.png',
    ' # ': 'event_02.png',
    ' B ': 'event_02.png',
    ' P ': 'event_02.png',
    ' H ': 'event_02.png',
    ' ● ': null,
    ' ◎ ': null,
    ' N ': 'event_02.png',
};

export default class Minimap extends PIXI.Application {
    constructor(width, height, canvas) {
        super(width, height, { 
            // backgroundColor: 0x6BACDE,
            transparent: true,
            view: canvas,
        });

        this.screenWidth = width;
        this.screenHeight = height;
    }

    makeNewMap(map, realmap) {
        this.stage.removeChildren();

        this.mapContainer = new PIXI.Container();
        this.realmap = realmap;
        this.mapTile = {};
        this.mapLength = map[0].length;

        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                if (MAP_DATA[map[y][x]]) {
                    const mapTile = new MiniMapTile(MAP_DATA[map[y][x]]);
                    mapTile.position.x = (x * TILE_WIDTH/2) - (y * TILE_WIDTH / 2);
                    mapTile.position.y = (x * TILE_HEIGHT/2) + (y * TILE_HEIGHT / 2);
                    this.mapTile[Math.round(x + y * this.mapLength)] = mapTile;
    
                    this.mapContainer.addChild(mapTile);
                }
            }
        }
        this.stage.addChild(this.mapContainer);

        this.locationIcon = new PIXI.Sprite(PIXI.Texture.fromFrame('location_icon.png'));
        this.locationIcon.scale.x = 0.05;
        this.locationIcon.scale.y = 0.05;
        this.locationIcon.anchor.x = 0.5;
        this.locationIcon.anchor.y = 0.95;
        this.locationIcon.position.x = this.screenWidth/2;
        this.locationIcon.position.y = this.screenHeight/2;
        this.stage.addChild(this.locationIcon);
    }

    moveTo(stage) {
        if (!this.realmap) {
            return ;
        }

        for (let y = 0; y < this.realmap.length; y++) {
            for (let x = 0; x < this.realmap[y].length; x++) {
                if (this.realmap[y][x] === stage && this.mapContainer) {
                    this.mapContainer.position.x = (this.screenWidth / 2) - ((x * TILE_WIDTH / 2) - (y * TILE_WIDTH / 2) + TILE_WIDTH / 2);
                    this.mapContainer.position.y = (this.screenHeight / 2) - ((x * TILE_HEIGHT / 2) + (y * TILE_HEIGHT / 2) + TILE_HEIGHT / 2);
                    this.mapTile[Math.round(x + y * this.mapLength)].show();
                    
                    if (stage.neighbor.up) {
                        this.mapTile[(x) + (y-1) * this.mapLength].show();
                    }
                    if (stage.neighbor.down) {
                        this.mapTile[(x) + (y+1) * this.mapLength].show();
                    }
                    if (stage.neighbor.left) {
                        this.mapTile[(x-1) + (y) * this.mapLength].show();
                    }
                    if (stage.neighbor.right) {
                        this.mapTile[(x+1) + (y) * this.mapLength].show();
                    }
                }
            }
        }
    }
}

class MiniMapTile extends PIXI.Container {
    constructor(textureName) {
        super();
        const spirte = new PIXI.Sprite(PIXI.Texture.fromFrame(textureName));
        this.addChild(spirte);
        this.visible = false;
    }

    show() {
        this.visible = true;
    }
}