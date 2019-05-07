import Game from './js/game'
import UI from './js/ui'
import ResourceManager from './js/resource-manager'

import DomUI from './js/domUI'
import CharacterFactory from './js/characterfactory';

function initApp() {
  const pixi = new PIXI.Application(980, 500, {
    backgroundColor: 0x6BACDE,
    
  });

  pixi.view.id = 'Game';
  document.body.appendChild(pixi.view);

  // 오프닝을 준비한다
  const loader = new ResourceManager();

  loader.add('opening.png', 'assets/opening.png');
  loader.add('border.png', 'assets/border.png');
  loader.load(() => {
    // 화면을 그린다
    // 버튼을 클릭하면 게임을 시작한다
    const sprite = new PIXI.Sprite(PIXI.Texture.fromFrame('opening.png'))
    sprite.interactive = true;
    pixi.stage.addChild(sprite);
    sprite.mouseup = () => {
      gameStart(pixi);
    };

    pixi.stage.addChild(new PIXI.Sprite(PIXI.Texture.fromFrame("border.png")));
  });
}


function gameStart(pixi) {
  // 나중에 스테이지 데이터와 캐릭터 데이터를 자동으로 추출할수 있게 해야한다
  // 로딩 속도를 최적화 하기 위해서
  // 일단은 모든 데이터를 다 넣도록 하자 (알아서 캐싱된다)

  pixi.stage.removeChildren();
  const game = new Game(pixi);
  pixi.stage.addChild(new PIXI.Sprite(PIXI.Texture.fromFrame("border.png")));

  game.resourceManager.add("dialog.png", "assets/dialog.png");
  game.resourceManager.add("dialogtitle.png", "assets/dialogtitle.png");
  game.resourceManager.add("theater.png", "assets/theater.png");
  game.resourceManager.add("item3.png", "assets/items/item3.png");
  game.resourceManager.add("chatballon.png", "assets/ui/chatballon.png");
  game.resourceManager.add("chatballon_comma.png", "assets/ui/chatballon_comma.png");
  game.resourceManager.add("ending.png", "assets/ending.png");
  game.resourceManager.add("inventory.png", "assets/inventory.png");
  game.resourceManager.add("combine.png", "assets/combine.png");
  game.resourceManager.add("combine_listitem.png", "assets/combine_listitem.png");
  game.resourceManager.add("combine_button.png", "assets/combine_button.png");
  game.resourceManager.add("player1_active.png", "assets/player1_active.png");
  game.resourceManager.add("player2_active.png", "assets/player2_active.png");
  game.resourceManager.add("player3_active.png", "assets/player3_active.png");
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

  // 전투용 이미지. 나중에 모두 제거해야 한다
  game.resourceManager.add("assets/night/atk_sw.json");
  game.resourceManager.add("assets/night/atk_nw.json");
  game.resourceManager.add("assets/night/idle_sw.json");
  game.resourceManager.add("assets/night/idle_nw.json");
  game.resourceManager.add("assets/night/walk_sw.json");
  game.resourceManager.add("assets/night/walk_nw.json");
  game.resourceManager.add("assets/night/crouch_nw.json");
  game.resourceManager.add("assets/night/crouch_sw.json");
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
  game.resourceManager.add("assets/explosion.json");
  game.resourceManager.add("assets/shoted.json");
  game.resourceManager.add("fireBall.png", "assets/fireBall.png");
  game.resourceManager.add("arrow.png", "assets/arrow.png");

  CharacterFactory.loadCharacterJson();



  game.loadCommon(() => {
    const ui = new UI(game);
    game.ui = ui;

    //dom UI test
    const domUI = new DomUI(game);
    
    game.start({
      stagePath: 'assets/mapdata/house.json'
    });
    const game_update = () => {
      game.update();
      ui.update();
      requestAnimationFrame(game_update);      
    }
    game_update();

    domUI.setProfile(1);
    domUI.showStageTitle('어둠의 타워 999층', 1500);

    let toggle = true;

    window.addEventListener("keydown", (e) => {
      if (e.keyCode === 66) {
        // 스테이지를 변경한다
        toggle = !toggle;
        if (toggle) {
          game.enterBattle();
        } else {
          game.leaveBattle();
        }
      } else if (e.keyCode === 67) {
        const confirm = ui.createConfirmModal("테스트");
      } else if (e.keyCode === 65) { // a 
        domUI.showItemAquire(1);
      } else if (e.keyCode === 77) { // m

        // 인자값 - dialog text, 말하는 대상 (캐릭터 : 1~ , 시스템 : 0 ) 
        const scriptData = [
          {text: '돈이 없다고 이런곳에서 살아야 하나 ...', speaker: 1}, 
          {text:'난 어제 내집에서 잘 수 있을까', speaker: 2},
          {text:'... 우울해지네', speaker: 1},
          {text:'힘내힘내', speaker: 3},
          {text:'아 모르겠다! 일단 작업용 탁자나 찾아보자', speaker: 1}
        ];
        
        domUI.showDialog(scriptData);

      } else if (e.keyCode === 68) { // d
        domUI.showCombineItemList();
      }

    }, true);
  });
}

initApp();