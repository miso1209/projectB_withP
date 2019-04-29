import MovieClip from './movieclip';
import Tweens from './tweens';
import { DIRECTIONS } from './define';

export const BASE_POSITION = {
    PLAYER_X: 182,
    PLAYER_Y: 243,
    ENEMY_X: 357,
    ENEMY_Y: 153,
    CENTER_X: -54,
    CENTER_Y: -140
};

/*
    지금 맵 따로, 캐릭터 배치되는 위치 따로, 이펙터 위치 따로 움직인다. 이걸 어떻게 처리할지 생각해야 할 것이다.
    캐릭터 이펙트, 맵, 캐릭터 배치 container는 같이가야 하지만,
    화면 Flash는 따로가야 한다. 이 부분 생각해서 다시 만들어 둘 것..
*/
export default class BattleStage extends PIXI.Container {
    constructor(mapName) {
        super();

        this.scale.x = 2;
        this.scale.y = 2;
        
        // 통짜 배틀 이미지를 박는다.. 추후 크기를 고정사이즈로 정의하든, 몇개의 사이즈(small, big, wide 같이..?)를 규격화하든 해야할 것 같다.
        const battleStageSprite = new PIXI.Sprite(PIXI.Texture.fromFrame(mapName));
        this.map = battleStageSprite;
        this.addChild(battleStageSprite);

        this.movies = [];
        this.tweens = new Tweens();
    }

    update() {
        this.updateMovieclips();
        this.tweens.update();
    }

    // Stage Vibration을 위한 코드.. 따라서 이것도 사실상 Stage 관련으로 빠져야한다.
    updateMovieclips() {
        let len = this.movies.length;
        for (let i = 0; i < len; i++) {
            const movie = this.movies[i];
            movie.update();
            if (!movie._playing) {
                this.movies.splice(i, 1);
                i--; len--;
            }
        }
    }

    setParty(party, baseX, baseY, directions) {
        let [front, back] = [party.front, party.back];
        if (directions === DIRECTIONS.SW) {
            [front, back] = [back, front];
        }

        front.concat(back).forEach((character, index) => {
            if (character) {
                character.position.x = baseX - 36 + (index % 3) * 36;
                character.position.y = baseY - 20 + (index % 3) * 20;
                character.changeVisualToDirection(directions);
                this.addChild(character);
            }

            if (index === 2) {
                baseX -= 36;
                baseY += 20;
            }
        });
    }

    focusMapAbsolutePos(position, direct, callback) {
        position.x = position.x !== undefined? position.x: this.map.position.x;
        position.y = position.y !== undefined? position.y: this.map.position.y;
        if (direct) {
            this.map.position.x = position.x;
            this.map.position.y = position.y;
            if (callback) {
                callback();
            }
        } else {
            this.tweens.addTween(this.map.position, 1, { x: position.x, y: position.y }, 0, "easeInOut", true, () => {
                if (callback) {
                    callback();
                }
            });
        }
    }
    
    // Stage 관련 코드 => 맵 흔들림, 맵 포지션 변경(사실상 카메라)는 따로 빼야하지 않을까?.. 여긴 전투로직 만들어야 할 것 같은데..? 
    focusCenterPos(callback) {
        this.tweens.addTween(this.position, 1, { x: BASE_POSITION.CENTER_X, y: BASE_POSITION.CENTER_Y }, 0, "easeInOut", true, () => {
            if (callback) {
                callback();
            }
        });
    }

    // stage 의 position을 vibration중에 건드린다면 문제가 될 수 있다.
    vibrationStage(scale, duration) {
        const x = this.position.x;
        const y = this.position.y;
        let vibrationScale = scale;

        const movieClip = new MovieClip(
            MovieClip.Timeline(1, duration, null, () => {
                this.position.x = x + vibrationScale;
                this.position.y = y + vibrationScale;
                vibrationScale = vibrationScale / 6 * -5;
            }),
            MovieClip.Timeline(duration + 1, duration + 1, null, () => {
                this.position.x = x;
                this.position.y = y;
            })
        );

        this.movies.push(movieClip);
        movieClip.playAndStop();
    }
}