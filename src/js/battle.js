import BattleCharacter from "./battleCharacter";
import CharacterFactory from "./characterFactory";
import { DIRECTIONS } from "./define";
import BattleEffect from "./battleEffect";
import MovieClip from './movieclip';

const BASE_POSITION = {
    PLAYER_X: 182,
    PLAYER_Y: 243,
    ENEMY_X: 321,
    ENEMY_Y: 173,
    CENTER_X: -54,
    CENTER_Y: -140
}

class BattleQueue {
    constructor() {
        this.skillQueue = [];
    }

    hasAction() {
        return this.skillQueue.length > 0;
    }

    enqueue(skill) {
        this.skillQueue.push(skill);
    }

    dequeue() {
        let result = this.skillQueue.shift();
        return result;
    }
}

export default class Battle {
    constructor(game) {
        this.game = game;
    }

    prepare() {
        this.basicQueue = new BattleQueue();
        this.battleEffect = new BattleEffect();
        this.currentAction = null;

        this.stage = new PIXI.Container();
        this.stage.scale.x = 2;
        this.stage.scale.y = 2;
        
        // 통짜 배틀 이미지를 박는다.. 추후 크기를 고정사이즈로 정의하든, 몇개의 사이즈(small, big, wide 같이..?)를 규격화하든 해야할 것 같다.
        const battleStageSprite = new PIXI.Sprite(PIXI.Texture.fromFrame("battleMap1.png"));
        this.stage.addChild(battleStageSprite);
        this.movies = [];

        // 캐릭터 생성하여 배치한다.
        const hectorSpec = CharacterFactory.createCharacterSpec('hector');
        const miludaSpec = CharacterFactory.createCharacterSpec('miluda');
        const elidSpec = CharacterFactory.createCharacterSpec('elid');
        this.players = [new BattleCharacter(hectorSpec), new BattleCharacter(miludaSpec), new BattleCharacter(elidSpec)];
        this.enemies = [new BattleCharacter(miludaSpec), new BattleCharacter(elidSpec), new BattleCharacter(hectorSpec)];

        this.setCharacters(this.players, BASE_POSITION.PLAYER_X, BASE_POSITION.PLAYER_Y, DIRECTIONS.NE);
        this.setCharacters(this.enemies, BASE_POSITION.ENEMY_X, BASE_POSITION.ENEMY_Y, DIRECTIONS.SW);

        this.stage.addChild(this.battleEffect);

        this.focusCenterPos();
    }

    start() {
    }

    update() {
        this.movieClipsUpdate();
        this.battleEffect.update();
        this.charactersUpdate();

        if (this.isBattleEnd() && !this.currentAction) {
            return;
        }

        if (this.currentAction) {
            // 액션 완료되면 action 함수는 NUll 반환하여 currentAction을 null로 만듬.
            this.currentAction = this.currentAction.action(this);
        } else if (this.basicQueue.hasAction()) {
            this.currentAction = this.basicQueue.dequeue();
            this.currentAction.init(this);
        }
    }

    charactersUpdate() {
        this.players.forEach((player) => {
            player.update(this);
        });
        this.enemies.forEach((enemy) => {
            enemy.update(this);
        });
    }

    isBattleEnd() {
        let playerCount = 0;
        this.players.forEach((player) => {
            if (player.hp > 0) {
                playerCount++;
            }
        });

        let enemyCount = 0;
        this.enemies.forEach((enemy) => {
            if (enemy.hp > 0) {
                enemyCount++;
            }
        });

        return (enemyCount === 0 || playerCount === 0)? true: false;
    }

    setCharacters(characters, baseX, baseY, directions) {
        characters.forEach((character, index) => {
            character.position.x = baseX - (characters.length - 1) * 18 + index * 36;
            character.position.y = baseY - (characters.length - 1) * 10 + index * 20;
            character.changeVisualToDirection(directions);
            this.stage.addChild(character);
        });
    }
    
    // Stage 관련 코드 => 맵 흔들림, 맵 포지션 변경(사실상 카메라)는 따로 빼야하지 않을까?.. 여긴 전투로직 만들어야 할 것 같은데..? 
    focusCenterPos() {
        this.stage.position.x = BASE_POSITION.CENTER_X;
        this.stage.position.y = BASE_POSITION.CENTER_Y;
    }

    // stage 의 position을 vibration중에 건드린다면 문제가 될 수 있다.
    vibrationStage(scale) {
        const x = this.stage.position.x;
        const y = this.stage.position.y;
        let vibrationScale = scale;

        const movieClip = new MovieClip(
            MovieClip.Timeline(1, 12, null, () => {
                this.stage.position.x = x + vibrationScale;
                this.stage.position.y = y + vibrationScale;
                vibrationScale = vibrationScale / 6 * -5;
            }),
            MovieClip.Timeline(13, 13, null, () => {
                this.stage.position.x = x;
                this.stage.position.y = y;
            })
        );

        this.movies.push(movieClip);
        movieClip.playAndStop();
    }

    movieClipsUpdate() {
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
}