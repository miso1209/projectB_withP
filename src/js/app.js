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
            backgroundColor: 0x000000,
            view: document.getElementById('canvas'),
        }, true);
    }

    // dom - intro
    initIntro() {
        this.intro = new MakeDom('div', 'intro');
        this.intro.style.top = this.pixi.view.offsetTop + 'px';

        const logo = new MakeDom('div', 'logo');
        const buttonWrap = new MakeDom('div', 'buttonWrap');

        this.newgame = document.createElement('a');
        this.newgame.className = 'intro-button_new';
        this.newgame.innerText = '새 게임';
        
        this.loadgame = document.createElement('a');
        this.loadgame.className = 'intro-button_load';
        this.loadgame.innerText = '계속하기';

        buttonWrap.appendChild(this.newgame);
        buttonWrap.appendChild(this.loadgame);
        this.intro.appendChild(logo);
        this.intro.appendChild(buttonWrap);

        document.body.appendChild(this.intro);
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
    }


    showIntro() {
        const loader = new Loader();
        loader.add('border.png', 'assets/border.png');
        loader.load(() => {

            this.initIntro();

            this.newgame.addEventListener('click', ()=> {
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
        // this.pixi.stage.addChild(new PIXI.Sprite(PIXI.Texture.fromFrame("border.png"))); 
        // 게임을 시작한다
        this.game.setStorage(this.storage);
        this.dev.setGame(this.game);

        this.game.$preload().then(() => {
            this.game.start();
            this.update();
        });
    }

    update() {
        this.game.update();
        requestAnimationFrame(this.update.bind(this));      
    }
}