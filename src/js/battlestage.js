import MovieClip from './movieclip';

export const BASE_POSITION = {
    PLAYER_X: 182,
    PLAYER_Y: 243,
    ENEMY_X: 321,
    ENEMY_Y: 173,
    CENTER_X: -54,
    CENTER_Y: -140
};

export default class BattleStage extends PIXI.Container {
    constructor(mapName) {
        super();

        this.scale.x = 2;
        this.scale.y = 2;
        
        // 통짜 배틀 이미지를 박는다.. 추후 크기를 고정사이즈로 정의하든, 몇개의 사이즈(small, big, wide 같이..?)를 규격화하든 해야할 것 같다.
        const battleStageSprite = new PIXI.Sprite(PIXI.Texture.fromFrame(mapName));
        this.addChild(battleStageSprite);

        this.movies = [];
    }

    update() {
        this.updateMovieclips();
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

    setCharacters(characters, baseX, baseY, directions) {
        characters.forEach((character, index) => {
            character.position.x = baseX - (characters.length - 1) * 18 + index * 36;
            character.position.y = baseY - (characters.length - 1) * 10 + index * 20;
            character.changeVisualToDirection(directions);
            this.addChild(character);
        });
    }
    
    // Stage 관련 코드 => 맵 흔들림, 맵 포지션 변경(사실상 카메라)는 따로 빼야하지 않을까?.. 여긴 전투로직 만들어야 할 것 같은데..? 
    focusCenterPos() {
        this.position.x = BASE_POSITION.CENTER_X;
        this.position.y = BASE_POSITION.CENTER_Y;
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