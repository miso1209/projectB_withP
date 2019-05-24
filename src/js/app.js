import Loader from './loader';
import Storage from './storage';
import DevConsole from './devconsole';
import Game from './game';
import UI from './ui/ui';

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
                    this.game.enterBattle();
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

    setUICallback() {
        this.game.on('combine-open', this.openCombiner.bind(this));
        this.game.on('dialog-show', this.showDialog.bind(this));
        this.game.on('confirm-show', this.showConfirm.bind(this))
        this.game.on('cutscene-start', this.startCutscene.bind(this))
        this.game.on('cutscene-end', this.endCutscene.bind(this))
        this.game.on('quest-update', this.questUpdated.bind(this))
        this.game.on('item-acquire', this.showItemAcquired.bind(this))

        this.ui.on('inventory', this.openInventory.bind(this));
    }

    openCombiner(data) {
        this.ui.showCombineItemList(data, (item) => {
            // TODO : 나중에 아이템 이름과 아이콘을 표시할수 있도록 하자
            this.ui.showCraftUI(null, () => {
                this.game.combine(item.item);
                // 아이템 획득 UI 를 표시한다
                const inst = this.game.player.inventory.getItem(item.item);
                this.ui.showItemAquire(inst);
            })
        });
    }

    showDialog(data, callback) {
        this.ui.showDialog(data, callback);
    }

    showConfirm(text, callback) {
        // TODO : 프로그레시브 모달이 필요
        this.ui.showConfirmModal(text, callback);
    }
    
    startCutscene() {
        this.ui.showTheaterUI(0.5);
        this.ui.hideMenu();
    }

    endCutscene() {
        this.ui.hideTheaterUI(0.5);
        this.ui.showMenu();
    }

    openInventory() {
        // 게임에서 인벤토리 데이터를 얻어온다
        const inputs = this.game.getInvenotryData();
        this.ui.showInventory(inputs);
    }

    questUpdated(id, data) {
        // 데이터를 저장한다
        this.storage.setQuest(id, data);
        // quset ui 를 업데이트한다
    }

    showItemAcquired(item) {
        this.ui.showItemAquire(item);
    }
}