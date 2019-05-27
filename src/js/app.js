import Loader from './loader';
import Storage from './storage';
import DevConsole from './devconsole';
import Game from './game';
import Monster from './monster';

export default class App {
    constructor() {
        this.storage = new Storage();
        this.dev = new DevConsole();
        this.game = null;

        this.pixi = new PIXI.Application(980, 500, { 
            backgroundColor: 0x6BACDE,
            view: document.getElementById('canvas'),
        });
    }

    showIntro() {
        const loader = new Loader();

        loader.add('opening.png', 'assets/opening.png');
        loader.add('border.png', 'assets/border.png');
        loader.load(() => {
            // 화면을 그린다
            // 버튼을 클릭하면 게임을 시작한다
            const sprite = new PIXI.Sprite(PIXI.Texture.fromFrame('opening.png'))
            sprite.interactive = true;
            sprite.mouseup = () => {
                this.pixi.stage.removeChildren();
                this.startGame();
            };
        
            this.pixi.stage.addChild(sprite);
            this.pixi.stage.addChild(new PIXI.Sprite(PIXI.Texture.fromFrame("border.png")));
        });
    }

    startGame() {
        this.game = new Game(this.pixi);
        // TODO: 나중에 dom 으로 바꾸도록 한다
        this.pixi.stage.addChild(new PIXI.Sprite(PIXI.Texture.fromFrame("border.png"))); 

        // 게임을 시작한다
        this.game.setStorage(this.storage);
        this.dev.setGame(this.game);
        
        // TODO : ui 에서 ui2 로 변경중
        this.ui = this.game.ui;
        //this.setUICallback();

        this.game.$preload().then(() => {
            this.game.start();
            this.update();
        });




        window.addEventListener("keydown", (e) => {
            if (e.keyCode === 66) { // b 키 전투 테스트는 여기서 하세요
                // 스테이지를 변경한다
                if (this.game.currentMode === this.game.exploreMode) {
                    this.ui.hideMenu();
                    this.game.enterBattle(Monster.GetByStage("house")[0]);
                } else {
                    this.game.leaveBattle();
                    this.ui.showMenu();
                }
            }
            if (e.keyCode === 68) { // d키 // ui 는 여기서 테스트
                this.ui.showCombineItemList([
                    { category: 'armor', recipes: this.game.getRecipes('armor') },
                    { category: 'consumables', recipes: this.game.getRecipes('consumables') },
                    { category: 'weapon', recipes: this.game.getRecipes('weapon') }], 
                    (isOk) => { console.log(isOk); });
              }

        });

        
    }

    update() {
        this.game.update();
        requestAnimationFrame(this.update.bind(this));      
    }
}