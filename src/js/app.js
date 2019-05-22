import ResourceManager from './resource-manager';
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
        const loader = new ResourceManager();

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

        const game = this.game;

        // TODO : 나중에 제거하도록 하자
        game.resourceManager.add("dialog.png", "assets/dialog.png");
        game.resourceManager.add("dialogtitle.png", "assets/dialogtitle.png");
        game.resourceManager.add("theater.png", "assets/theater.png");
        game.resourceManager.add("item3.png", "assets/items/item3.png");
        game.resourceManager.add("chatballon.png", "assets/ui/chatballon.png");
        game.resourceManager.add("chatballon_comma.png", "assets/ui/chatballon_comma.png");
        game.resourceManager.add("ending.png", "assets/ending.png");
        // game.resourceManager.add("inventory.png", "assets/inventory.png");
        game.resourceManager.add("combine.png", "assets/combine.png");
        game.resourceManager.add("combine_listitem.png", "assets/combine_listitem.png");
        game.resourceManager.add("combine_button.png", "assets/combine_button.png");
        game.resourceManager.add("player1_active.png", "assets/player1_active.png");
        game.resourceManager.add("player2_active.png", "assets/player2_active.png");
        game.resourceManager.add("player3_active.png", "assets/player3_active.png");
        game.resourceManager.add("player4_active.png", "assets/player4_active.png");
        game.resourceManager.add("player5_active.png", "assets/player5_active.png");
        game.resourceManager.add("ch01_skill01_on.png", "assets/ch01_skill01_on.png");
        game.resourceManager.add("ch01_skill02.png", "assets/ch01_skill02.png");
        game.resourceManager.add("ch02_skill01_on.png", "assets/ch02_skill01_on.png");
        game.resourceManager.add("ch02_skill02.png", "assets/ch02_skill02.png");
        game.resourceManager.add("ch03_skill01_on.png", "assets/ch03_skill01_on.png");
        game.resourceManager.add("ch03_skill02.png", "assets/ch03_skill02.png");
        game.resourceManager.add("monster01_active.png", "assets/monster01_active.png");
        game.resourceManager.add("monster02_active.png", "assets/monster02_active.png");
        game.resourceManager.add("monster03_active.png", "assets/monster03_active.png");
        game.resourceManager.add("ending_victory.png", "assets/ending_victory.png");
        game.resourceManager.add("battleMap1.png", "assets/battleMap1.png");
        game.resourceManager.add("battle_background.png", "assets/battle_background.png");

        game.resourceManager.add("assets/warrior/warrior_atk_sw.json");
        game.resourceManager.add("assets/warrior/warrior_atk_nw.json");
        game.resourceManager.add("assets/warrior/warrior_atk_2_sw.json");
        game.resourceManager.add("assets/warrior/warrior_atk_2_nw.json");
        game.resourceManager.add("assets/warrior/warrior_idle_sw.json");
        game.resourceManager.add("assets/warrior/warrior_idle_nw.json");
        game.resourceManager.add("assets/warrior/warrior_walk_sw.json");
        game.resourceManager.add("assets/warrior/warrior_walk_nw.json");

        game.resourceManager.add("assets/healer/healer_atk_sw.json");
        game.resourceManager.add("assets/healer/healer_atk_nw.json");
        game.resourceManager.add("assets/healer/healer_magic_sw.json");
        game.resourceManager.add("assets/healer/healer_magic_nw.json");
        game.resourceManager.add("assets/healer/healer_idle_sw.json");
        game.resourceManager.add("assets/healer/healer_idle_nw.json");
        game.resourceManager.add("assets/healer/healer_walk_sw.json");
        game.resourceManager.add("assets/healer/healer_walk_nw.json");

        game.resourceManager.add("shadow.png", "assets/shadow.png");
        game.resourceManager.add("pbar.png", "assets/pbar.png");
        game.resourceManager.add("pbar_r.png", "assets/pbar_r.png");
        game.resourceManager.add("pbar_g.png", "assets/pbar_g.png");
        game.resourceManager.add("pbar_o.png", "assets/pbar_o.png");
        game.resourceManager.add("assets/elid/elid_atk_nw.json");
        game.resourceManager.add("assets/elid/elid_atk_sw.json");
        game.resourceManager.add("assets/elid/elid_idle_nw.json");
        game.resourceManager.add("assets/elid/elid_idle_sw.json");
        game.resourceManager.add("assets/miluda/miluda_atk_sw.json");
        game.resourceManager.add("assets/miluda/miluda_atk_nw.json");
        game.resourceManager.add("assets/miluda/miluda_idle_sw.json");
        game.resourceManager.add("assets/miluda/miluda_idle_nw.json");
        game.resourceManager.add("assets/titan/monster2-atk_sw.json");
        game.resourceManager.add("assets/titan/monster2-idle_sw.json");
        game.resourceManager.add("assets/medusa/monster1-atk_sw.json");
        game.resourceManager.add("assets/medusa/monster1_idle_sw.json");
        game.resourceManager.add("assets/slash_1.json");
        game.resourceManager.add("assets/shotingeffect.json");
        game.resourceManager.add("assets/healeffect.json");
        game.resourceManager.add("assets/firerainprop.json");
        game.resourceManager.add("assets/explosion.json");
        game.resourceManager.add("assets/shoted.json");
        game.resourceManager.add("fireBall.png", "assets/fireBall.png");
        game.resourceManager.add("shield.png", "assets/shield.png");
        game.resourceManager.add("arrow.png", "assets/arrow.png");

        game.loadCommon(() => {
            this.start();
        });
    }

    start() {
        // 게임을 시작한다
        this.game.setStorage(this.storage);
        this.dev.setGame(this.game);
        
        // TODO : ui 에서 ui2 로 변경중
        this.ui = new UI();
        this.setUICallback();

        this.game.start();
        this.update();

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

        this.ui.on('inventory', this.openInventory.bind(this));
    }

    openCombiner(data) {
        this.ui.showCombineItemList(data, (item) => {
            // TODO : 나중에 아이템 이름과 아이콘을 표시할수 있도록 하자
            this.ui.showCraftUI(null, () => {
                this.game.combine(item.item);
                // 아이템 획득 UI 를 표시한다
                this.ui.showItemAquire(item.item);
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
}