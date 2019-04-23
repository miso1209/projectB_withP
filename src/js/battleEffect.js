import MovieClip from './movieclip';

export default class BattleEffect extends PIXI.Container {
    constructor() {
        super();
        this.movies = [];
    }

    addDamageEffect(target, damage, color) {
        const that = this;
        const style = new PIXI.TextStyle();
        style.dropShadow = true;
        style.dropShadowDistance = 3;
        style.fontStyle = 'italic';
        style.fontWeight = 'bold';
        style.fontSize = 20;
        style.fill = color ? color : "#ffffff";

        const text = new PIXI.Text('-' + damage, style);
        text.anchor.x = 0.5;
        text.position.x = target.position.x + target.width / 2 - 5;
        text.position.y = target.position.y - target.height / 2 - 3;
        text.alpha = 0;
        this.addChild(text);

        const movieClip = new MovieClip(
            MovieClip.Timeline(1, 30, text, [["alpha", 0, 1, "outCubic"]]),
            MovieClip.Timeline(1, 30, text, [["y", text.position.y, text.position.y - 10, "outCubic"]]),
            MovieClip.Timeline(61, 91, text, [["alpha", 1, 0, "outCubic"]]),
            MovieClip.Timeline(91, 91, null, () => {
                that.removeChild(text);
            }),
        );
        this.movies.push(movieClip);
        movieClip.playAndStop();

    }

    update() {
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