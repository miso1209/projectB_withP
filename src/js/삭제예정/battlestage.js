/*import { BattleEffecter } from "./battleeffecter";
import { STAGE_BASE_POSITION, CHARACTER_CAMP } from "./battledeclare";
import { DIRECTIONS } from "./define";*/

// 배틀의 실제 스테이지에 관련된 클래스 작성한다.
export class BattleStage extends PIXI.Container {
    // map Texture 어떻게 변경할거야?
    constructor(screenSize) {
        super();

        this.screenSize = screenSize;
        this.container = new PIXI.Container(); // 이펙트, 캐릭터, 맵
        this.characters = new PIXI.Container(); // 캐릭터, 맵
        this.map = new PIXI.Sprite(PIXI.Texture.fromFrame("battleMap1.png"));
        this.background = new PIXI.Sprite(PIXI.Texture.fromFrame("battle_background.png"));
        this.effecter = new BattleEffecter();

        this.container.addChild(this.map);
        this.container.addChild(this.characters);
        this.container.addChild(this.effecter);

        this.addChild(this.background);
        this.addChild(this.container);
    }

    update() {
        this.effecter.update();
    }

    setCharacters(characters) {
        // ENEMY
        const columnSize = 3;

        characters.sort((a, b) => {
            return (-a.gridPosition.y * columnSize + a.gridPosition.x) > (-b.gridPosition.y * columnSize + b.gridPosition.x)?1 :-1;
        }).forEach((character) => {
            if (character.camp === CHARACTER_CAMP.ENEMY && character.health > 0) {
                character.position.x = STAGE_BASE_POSITION.ENEMY_X + character.gridPosition.x * 36 + character.gridPosition.y * 36;
                character.position.y = STAGE_BASE_POSITION.ENEMY_Y + character.gridPosition.x * 20 - character.gridPosition.y * 20;
                character.animation.changeVisualToDirection(DIRECTIONS.SW);
                this.characters.addChild(character);
            }
        });

        // ALLY
        characters.sort((a, b) => {
            return (a.gridPosition.y * columnSize + a.gridPosition.x) > (b.gridPosition.y * columnSize + b.gridPosition.x)?1 :-1;
        }).forEach((character) => {
            if (character.camp === CHARACTER_CAMP.ALLY && character.health > 0) {
                character.position.x = STAGE_BASE_POSITION.PLAYER_X + character.gridPosition.x * 36 - character.gridPosition.y * 36;
                character.position.y = STAGE_BASE_POSITION.PLAYER_Y + character.gridPosition.x * 20 + character.gridPosition.y * 20;
                character.animation.changeVisualToDirection(DIRECTIONS.NE);
                this.characters.addChild(character);
            }
        });
    }

    setStage(options) {
        if (options.background) {
            this.background = new PIXI.Sprite(PIXI.Texture.fromFrame(options.background));
        }
        if (options.map) {
            this.map = new PIXI.Sprite(PIXI.Texture.fromFrame(options.map));
        }
    }

    setScale(scale) {
        this.container.scale = scale;
    }

    focusCenter() {
        const offsetX = 41;
        const offsetY = -20;
        this.container.position.x = (this.screenSize.width - this.map.width * this.container.scale.x) / 2 + offsetX;
        this.container.position.y = (this.screenSize.height - this.map.height * this.container.scale.y) / 2 + offsetY;
    }
}

// 논리적인 보이지 않는 그리드를 가진 맵 작성해서 캐릭터 배치해볼 것..
class Map extends PIXI.Container {
    constructor(json) {
        super();
        this.mapSprite = new PIXI.Sprite(PIXI.Texture.fromFrame(json.map)); 
        this.addChild(this.mapSprite);
        this.column = json.column;
        this.row = json.row;
        this.centerPos = {
            x: Math.round(this.row / 2),
            y: Math.round(this.column / 2)
        }
    }

    get tileSize() {
        return {
            w: this.mapSprite.width / this.row,
            h: this.mapSprite.height / this.column
        }
    }

    setCharacters(characters) {
        characters.forEach((character) => {
            this.addChild(character);
            character.position.x = this.getPosition(this.centerPos.x + character.gridPosition.x).x;
            character.position.y = this.getPosition(this.centerPos.y + character.gridPosition.y).y;
        });
    }

    getPosition(gridPosition) {
       const basePosition = {
           x: this.tileSize.w / 2,
           y: this.tileSize.h / 2 + (this.tileSize.h * column / 2)
       };

       return {
           x: basePosition.x + ((gridPosition.x + gridPosition.y) * TILE_SIZE.w) / 2,
           y: basePosition.y + ((gridPosition.y - gridPosition.x) * TILE_SIZE.h) / 2,
       }
    }
}