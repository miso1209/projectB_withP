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
        this.background = null;
        this.map = new PIXI.Sprite(PIXI.Texture.fromFrame("battleMap1.png"));
        this.effecter = new BattleEffecter();

        this.state = STAGE_STATUS.MOVING;

        this.buildStage();
        this.container.position.x = 1200;
        this.setScale({x: 2, y: 2});
    }

    update() {
        this.movies.update();
        this.tweens.update();
        this.effecter.update();
    }

    setCharacters(characters, callback) {
        // 무비클립으로 순차적으로 애니메이션 처리하며 박아주자.
        characters.forEach((character) => {
            this.mapContainer.addChild(character);
            // 좌표수정.
            if (character.camp === CHARACTER_CAMP.ALLY) {
                character.position.x = STAGE_BASE_POSITION.PLAYER_X + character.gridPosition.x * 36 - character.gridPosition.y * 36;
                character.position.y = STAGE_BASE_POSITION.PLAYER_Y + character.gridPosition.x * 20 + character.gridPosition.y * 20;
                character.animation.changeVisualToDirection(DIRECTIONS.NE);
            } else if (character.camp === CHARACTER_CAMP.ENEMY) {
                character.position.x = STAGE_BASE_POSITION.ENEMY_X + character.gridPosition.x * 36 + character.gridPosition.y * 36;
                character.position.y = STAGE_BASE_POSITION.ENEMY_Y + character.gridPosition.x * 20 - character.gridPosition.y * 20;
                character.animation.changeVisualToDirection(DIRECTIONS.SW);
            }
        });

        if (callback) {
            callback();
        }
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

    setScale(scale) {
        this.container.scale = scale;
    }

    focusCenter() {
        this.state = STAGE_STATUS.MOVING;
        this.tweens.addTween(this.container.position, 1, { x: STAGE_BASE_POSITION.CENTER_X, y: STAGE_BASE_POSITION.CENTER_Y }, 0, "easeInOut", true, () => {
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