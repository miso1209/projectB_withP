import { BattleEffecter } from "./battleeffecter";
import { Movies } from "./battleutils";
import Tweens from "./tweens";
import { STAGE_BASE_POSITION, CHARACTER_CAMP, STAGE_STATUS } from "./battledeclare";
import { DIRECTIONS } from "./define";

// 배틀의 실제 스테이지에 관련된 클래스 작성한다.
export class BattleStage extends PIXI.Container {
    // map Texture 어떻게 변경할거야?
    constructor() {
        super();
        this.movies = new Movies();
        this.tweens = new Tweens();

        this.container = new PIXI.Container(); // 이펙트, 캐릭터, 맵
        this.mapContainer = new PIXI.Container(); // 캐릭터, 맵
        this.background = new PIXI.Sprite(PIXI.Texture.fromFrame("battle_background.png"));
        this.map = new PIXI.Sprite(PIXI.Texture.fromFrame("battleMap1.png"));
        this.effecter = new BattleEffecter();
        this.directScale = {
            x: 1,
            y: 1
        }

        this.state = STAGE_STATUS.MOVING;

        this.buildStage();
        this.container.position.x = 1200;
        // this.setScale({x: 2, y: 2});
    }

    update() {
        this.movies.update();
        this.tweens.update();
        this.effecter.update();
    }

    setCharacters(characters) {
        // ENEMY
        characters.sort((a, b) => {
            return (-a.gridPosition.y * 3 + a.gridPosition.x) > (-b.gridPosition.y * 3 + b.gridPosition.x)?1 :-1;
        }).forEach((character) => {
            if (character.camp === CHARACTER_CAMP.ENEMY && character.health > 0) {
                character.position.x = STAGE_BASE_POSITION.ENEMY_X + character.gridPosition.x * 36 + character.gridPosition.y * 36;
                character.position.y = STAGE_BASE_POSITION.ENEMY_Y + character.gridPosition.x * 20 - character.gridPosition.y * 20;
                character.animation.changeVisualToDirection(DIRECTIONS.SW);
                this.mapContainer.addChild(character);
            }
        });

        // ALLY
        characters.sort((a, b) => {
            return (a.gridPosition.y * 3 + a.gridPosition.x) > (b.gridPosition.y * 3 + b.gridPosition.x)?1 :-1;
        }).forEach((character) => {
            if (character.camp === CHARACTER_CAMP.ALLY && character.health > 0) {
                character.position.x = STAGE_BASE_POSITION.PLAYER_X + character.gridPosition.x * 36 - character.gridPosition.y * 36;
                character.position.y = STAGE_BASE_POSITION.PLAYER_Y + character.gridPosition.x * 20 + character.gridPosition.y * 20;
                character.animation.changeVisualToDirection(DIRECTIONS.NE);
                this.mapContainer.addChild(character);
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

    buildStage() {
        this.container = new PIXI.Container();
        this.mapContainer = new PIXI.Container();
        this.effecter = new BattleEffecter();

        if (this.background) {
            this.addChild(this.background);
        }
        if (this.map) {
            this.mapContainer.addChild(this.map);
        }

        this.container.addChild(this.mapContainer);
        this.container.addChild(this.effecter);
        this.addChild(this.container);
    }

    setScale(scale, direct) {
        this.directScale = scale;
        if (direct) {
            this.container.scale = scale;
        } else {
            this.tweens.addTween(this.container.scale, 1, scale, 0, "easeInOut", true, () => {
                this.state = STAGE_STATUS.DONE;
            });
        }
    }

    focusCenter() {
        this.state = STAGE_STATUS.MOVING;
        // 괄호는 맵 이미지에 대한 옵셋이다.
        this.tweens.addTween(this.container.position, 1, { x: 450 + (41) - this.map.width / 2 * this.directScale.x, y: 250 - (this.map.height + 20) / 2 * this.directScale.y }, 0, "easeInOut", true, () => {
            this.state = STAGE_STATUS.DONE;
        });
    }

    // Character는 State두어서 Vibration중첩 안생기겠지만 여전히 얘는 Vibration중첩이 생길 수 있다.
    vibrationStage(scale, duration) {
        if (this.state === STAGE_STATUS.DONE) {
            this.state = STAGE_STATUS.MOVING;

            const x = this.container.position.x;
            const y = this.container.position.y;
            let vibrationScale = scale;
    
            const movieClip = new MovieClip(
                MovieClip.Timeline(1, duration, null, () => {
                    this.container.position.x = x + vibrationScale;
                    this.container.position.y = y + vibrationScale;
                    vibrationScale = vibrationScale / 6 * -5;
                }),
                MovieClip.Timeline(duration + 1, duration + 1, null, () => {
                    this.container.position.x = x;
                    this.container.position.y = y;
                }),
                MovieClip.Timeline(duration + 2, duration + 2, null, () => {
                    this.state = STAGE_STATUS.DONE;
                })
            );
    
            this.movies.push(movieClip);
            movieClip.playAndStop();
        }
    }
}