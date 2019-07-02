import Loader from './loader';
import Storage from './storage';
import DevConsole from './devconsole';
import Game from './game';
import Monster from './monster';
import StoryMonsters from './storymonsters';
import MakeDom from './ui/component/makedom';
import SystemModal from './ui/systemmodal';


export default class App {
    constructor() {
        this.storage = new Storage();
        this.dev = new DevConsole();
        this.game = null;

        this.pixi = new PIXI.Application(980, 500, { 
            // backgroundColor: 0x6BACDE,
            backgroundColor: 0x000000,
            view: document.getElementById('canvas'),
        });
    }

    // dom - intro
    initIntro() {
        // intro 단계에서는 ui 접근이 되지 않으므로 dom 생성은 여기서.
        const intro = document.createElement('div');
        intro.className = 'intro';
        intro.style.top = this.pixi.view.offsetTop + 'px';
        
        const logo = document.createElement('div');
        logo.className = 'logo';

        const buttonWrap = document.createElement('div');
        buttonWrap.className = 'buttonWrap';

        this.newgame = document.createElement('a');
        this.newgame.className = 'intro-button_new';
        this.newgame.innerText = '새 게임';
        
        this.loadgame = document.createElement('a');
        this.loadgame.className = 'intro-button_load';
        this.loadgame.innerText = '계속하기';

        buttonWrap.appendChild(this.newgame);
        buttonWrap.appendChild(this.loadgame);
        intro.appendChild(logo);
        intro.appendChild(buttonWrap);
        document.body.appendChild(intro);

        this.intro = intro;
    }
    
    showConfirmModal(result) {
        let text = '지난 게임의 데이터가 모두 삭제됩니다. 계속하시겠습니까?';
        
        const container = new MakeDom('div', 'container');
        container.classList.add('screen');
        container.style.top = this.pixi.view.offsetTop + 'px';
        this.intro.appendChild(container);

        const confirmModal = new SystemModal(container, 300, 200, text, true, result);
        confirmModal.dom.style.top = '50%';
        confirmModal.dom.style.marginTop = 200 * -0.5 + 'px';
        confirmModal.contents.style.margin = '10% auto';
        confirmModal.contents.style.fontSize = '1.1rem';
    }


    showIntro() {
        const loader = new Loader();
        // loader.add('opening.png', 'assets/opening.png');
        loader.add('border.png', 'assets/border.png');

        loader.load(() => {
            // dom 으로 변경
            this.initIntro();

            // 화면을 그린다
            // 버튼을 클릭하면 게임을 시작한다
            // const sprite = new PIXI.Sprite(PIXI.Texture.fromFrame('opening.png'))
            // sprite.interactive = true;
            // sprite.mouseup = () => {
            //     this.pixi.stage.removeChildren();
            //     this.startGame();
            // };
            // this.pixi.stage.addChild(sprite);
            // this.pixi.stage.addChild(new PIXI.Sprite(PIXI.Texture.fromFrame("border.png")));

            this.newgame.addEventListener('click', ()=> {
                // TODO: 로컬스토리지 지우고 게임시작.
                this.showConfirmModal((result) => {
                    if(result === 'ok') {
                        this.storage.data = null;
                        this.intro.parentNode.removeChild(this.intro);
                        this.startGame();
                    } else {
                        this.intro.parentNode.removeChild(this.intro);
                        this.startGame();
                    }
                });
            });

            this.loadgame.addEventListener('click', ()=> {
                this.intro.parentNode.removeChild(this.intro);
                this.startGame();
            });
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
            if (e.keyCode === 68) { // d키 // ui 는 여기서 테스트 ---- 삭제 예정
                this.ui.showCombineItemList([
                    { category: 'armor', recipes: this.game.getRecipes('armor') },
                    { category: 'consumables', recipes: this.game.getRecipes('consumables') },
                    { category: 'weapon', recipes: this.game.getRecipes('weapon') }], 
                    (isOk) => { console.log(isOk); });
            }
            if (e.keyCode === 66) {
                const monster = {src: new Monster(StoryMonsters['archer'])};
                this.game.$enterBattle(monster);
            }
        });
    }

    update() {
        this.game.update();
        requestAnimationFrame(this.update.bind(this));      
    }
}