
export default class DomUI {
  constructor(game) {
    this.game = game;
    this.gamePane = document.getElementById('Game');
    this.screenWidth = this.gamePane.screenWidth;
    this.screenHeight = this.gamePane.screenHeight;
    
    this.gnbContainer = document.createElement('div');
    this.container = document.createElement('div');
  }

  createDom() {
    console.log('-- DomUI --');
    this.container.className = 'uiContainer';
    this.container.style.top = this.gamePane.offsetTop + 'px';

    document.body.appendChild(this.container);
    this.container.style.pointerEvents = 'none'; // 클릭 이벤트 방지 해제.
    // this.container.style.pointerEvents = 'auto'; // 클릭 이벤트 방지.
  }

  destroyDom(delay) {
    setTimeout(() => {
      document.body.removeChild(this.container);
    }, delay);
  }

  // 추가? lv, name
  setProfile(playerId) {
    const profile = new Profile(playerId);
    profile.name.style.display = 'none';
    profile.level.style.display = 'none';

    this.gnbContainer.className = 'gnbContainer';
    this.gnbContainer.style.top = this.gamePane.offsetTop + 'px';
    
    profile.moveToLeft(20);

    const btnInventory = new Button('', 'btnInventory');
    btnInventory.dom.style.top = '20px';
    btnInventory.dom.style.right = '20px';
    btnInventory.onClick = null;
    btnInventory.dom.addEventListener('click', this.showInventory.bind(this));

    this.gnbContainer.appendChild(profile.dom);
    this.gnbContainer.appendChild(btnInventory.dom);

    document.body.appendChild(this.gnbContainer);
  }

  showItemAquire(itemId){
    const itemAcquire = new Modal(this.container, 400, 300);
    itemAcquire.addTitle('NEW ITEM');

    let acquireText;
    const itemText = document.createElement('div');
    itemText.className = 'contents';

    if (itemId === 1) {
        acquireText = "[열쇠조각 A]를 얻었다";
    } else if (itemId === 2) {
        acquireText = "[열쇠조각 B]를 얻었다";
    } else if (itemId === 3) {
        acquireText = "[철문열쇠]를 얻었다";
    }

    itemText.innerHTML = acquireText;
    itemAcquire.dom.appendChild(itemText);

    const itemSprite = document.createElement('img');
    itemSprite.src = '/src/assets/items/item' + itemId + '.png';
    itemSprite.style.position = 'absolute';
    itemSprite.style.left = (itemAcquire.dom.clientWidth/2 - 36) + 'px'; 
    itemSprite.style.top = itemText.offsetTop + itemText.offsetHeight + 50 + 'px';
    
    itemAcquire.dom.appendChild(itemSprite);
  }

  showCombineItemList(){
    // # TODO : 조합가능한 아이템 리스트 노출
  }

  showInventory() {
    const inventory = new Modal(this.container, 360, 460);
    inventory.addTitle('Inventory');
    
    // # 인벤 탭 영역 작업예정
    const categoryWrap = document.createElement('div');
    categoryWrap.classList.add('contents');
    categoryWrap.classList.add('categoryWarp')

    
    // # stat
    const statContent = document.createElement('div');
    statContent.classList.add('contents');
    statContent.style.textAlign = 'left';
    statContent.style.top = categoryWrap.clientHeight + 100 + 'px';
    // statContent.style.height = '64px';
    
    inventory.dom.appendChild(statContent);

    // IE 스크롤바 이슈 대응
    const scrollView = document.createElement('div');
    scrollView.className = 'scrollView';

    const scrollBlind = document.createElement('div');
    scrollBlind.className = 'scrollBlind';

    const storageContent = document.createElement('ul');
    storageContent.classList.add('contents-list');
    scrollView.style.top = statContent.clientHeight + 100 + 'px';

    // # inventory size
    //let inventorySize = 4 * 4;
    let selectedSlot = null;
    
    // inventory items
    this.game.player.inventory.eachItem((item) => {
      const itemSprite = document.createElement('img');
      itemSprite.src = '/src/assets/items/' + item.image;
      itemSprite.style.width = '50px';


      const slot = document.createElement('li');
      slot.appendChild(itemSprite);
      storageContent.appendChild(slot);
      slot.style.height = '50px';

      slot.addEventListener('click', function(event){
        if (selectedSlot) {
          selectedSlot.classList.remove('active');
        }
        slot.classList.add('active');
        selectedSlot = slot;

        // 위에 도큐먼트를 추가한다
        while(statContent.hasChildNodes()) {
          statContent.removeChild(statContent.firstChild);
        }
        let stat = document.createElement('p');
        stat.innerText = item.description;
        statContent.appendChild(stat);
      });
    });
    
    scrollView.appendChild(scrollBlind);
    scrollBlind.appendChild(storageContent);
    inventory.dom.appendChild(scrollView);
  }


  showTooltip(container, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';

    container.appendChild(tooltip);
  }

  showStatUI() {
    const statUI = new Modal(this.container, 360, 460);
    statUI.addTitle('Player Status');
    statUI.className = 'statUI';

    // 캐릭터 정보
    let playerId = 1;
    const profile = new Profile(playerId);
    profile.moveToCenter(80);
    statUI.dom.appendChild(profile.dom);

    
    // 캐릭터 스탯 정보 - 임시..
    let statData = [];
    const contents = document.createElement('div');
    contents.classList.add('contents');
    contents.classList.add('column-2'); // 3단으로 할 때는 column-3
    contents.style.top = profile.dom.offsetTop + profile.dom.offsetHeight + 20 + 'px';

    statData.push("HP : 33");
    statData.push("MP : 3");
    statData.push("STRENGTH : 10");
    statData.push("DEFFENSE : 300");
    statData.push("RANGE : 100");
    statData.push("SPEED : 200");
    
    statData.forEach(text => {
      let stat = document.createElement('p');
      stat.innerText = text;
      contents.appendChild(stat);
    });


    // 현재 캐릭터 장비정보
    const equipItemsData = [{x:12, y:6, item:'wond'}, {x:20,y:2,item:'amor'}, {x:10, y:10,item:'bomb'}];
    const equipItems = document.createElement('div');

    equipItems.className = 'equipItems';
    equipItems.style.position = 'absolute';
    equipItems.style.bottom = contents.offsetTop + contents.offsetHeight + 20 + 'px';
    equipItems.style.left = '30px';
    equipItems.style.bottom = '100px';

    equipItemsData.forEach(item => {
      let itemIcon = document.createElement('p');
      itemIcon.className = 'stat-item';

      let itemName = document.createElement('span');
      itemName.innerText = item.item;

      itemIcon.style.backgroundImage = "url(./src/assets/items/items.png)";
      itemIcon.style.display = 'inline-block';
      itemIcon.style.width = '32px';
      itemIcon.style.height = '32px';
      itemIcon.style.backgroundPositionX = (item.x * 32) + 'px';
      itemIcon.style.backgroundPositionY = (item.y * 32) + 'px';

      itemIcon.append(itemName);
      equipItems.appendChild(itemIcon);
    });


     // 현재 캐릭터 스킬정보
  const skillItemData = [{x:1, y:6, skill:'Die'}, {x:4,y:6,skill:'Mad'}, {x:2, y:6, skill:'poison'}];
  const skillItems = document.createElement('div');
  skillItems.className = 'skillItems';
  skillItems.style.position = 'absolute';
  skillItems.style.bottom = contents.offsetTop + contents.offsetHeight + 20 + 'px';
  skillItems.style.right = '30px';
  skillItems.style.bottom = '100px';

  skillItemData.forEach(item => {
    let itemIcon = document.createElement('p');
    itemIcon.className = 'stat-item';

    let itemName = document.createElement('span');
    itemName.innerText = item.skill;

    itemIcon.style.backgroundImage = "url(./src/assets/items/items.png)";
    itemIcon.style.display = 'inline-block';
    itemIcon.style.width = '32px';
    itemIcon.style.height = '32px';
    itemIcon.style.backgroundPositionX = -(item.x * 32) + 'px';
    itemIcon.style.backgroundPositionY = -(item.y * 32) + 'px';

    itemIcon.append(itemName);
    skillItems.appendChild(itemIcon);
  });

    statUI.dom.appendChild(equipItems);
    statUI.dom.appendChild(skillItems);

    // 버튼
    const equip_btn = new Button('EQUIP');
    equip_btn.moveToLeft(20);
    equip_btn.moveToBottom(20);
    equip_btn.dom.classList.add('_small');
    equip_btn.dom.style.margin = '0 auto';


    const skill_btn = new Button('SKILL');
    skill_btn.moveToRight(20);
    skill_btn.moveToBottom(20);
    skill_btn.dom.classList.add('_small');
    skill_btn.dom.style.margin = '0 auto';


    statUI.dom.appendChild(contents);
    statUI.dom.appendChild(equip_btn.dom);
    statUI.dom.appendChild(skill_btn.dom);
  }

  showStageTitle(text, delay) {
    this.createDom();

    const title = new SceneTitle(text);
    this.container.appendChild(title.dom);
    
    title.dom.classList.add('stageTitle');
    title.dom.classList.add('animate');
    

    setTimeout(() => {
      title.dom.style.opacity = 0;
      this.destroyDom(delay);
    }, delay);
  }

  moveToCenter(_top){
    this.dom.style.position = 'absolute';
    this.dom.style.left = 0 + 'px';
    this.dom.style.right = 0 + 'px';
    this.dom.style.margin = `${_top}px auto 0`;
  }

  moveToLeft(_left){
    this.dom.style.position = 'absolute';
    this.dom.style.left = `${_left}px`;
    this.dom.style.top = `${_left}px`;
  }

  moveToRight(_right){
    this.dom.style.position = 'absolute';
    this.dom.style.right = `${_right}px`;
  }

  moveToBottom(_bottom){
    this.dom.style.position = 'absolute';
    this.dom.style.bottom = `${_bottom}px`;
    this.dom.style.top = 'auto';
  }

  setPosition(x, y) {
    this.dom.style.position = 'absolute';
    
    var offsetX = this.dom.offsetLeft;
    var offsetY = this.dom.offsetTop;

    this.dom.style.top = 'auto';
    this.dom.style.bottom = 'auto';

    this.dom.style.left = 'auto';
    this.dom.style.right = 'auto';
    this.dom.style.margin = '0';

    this.dom.style.left = offsetX + x + 'px';
    this.dom.style.top = offsetY + y + 'px';
  }

  setClass(dom, value) {
    return dom.classList.add(value);
  }

  showDialog(text) {
    const dialog = new Dialog(900, 140);
    dialog.setText(text);
  }

}

class Dialog extends DomUI {
  constructor(width, height) {
    super();
   
    this.createDom();

    const dialog = new NineBox(this.container, width, height, 'dialog');
    dialog.dom.className = 'dialog';
    dialog.moveToBottom(20);
    this.container.appendChild(dialog.dom);
    this.dom = dialog.dom;

    dialog.dom.addEventListener('click', function() {
      dialog.dom.parentNode.parentNode.removeChild(dialog.dom.parentNode);
    });
  }

  setText(text) {
    const content = document.createElement('p');
    content.classList.add('contents');
    content.classList.add('typeWriter');
    content.innerText = text;

    this.dom.appendChild(content);
  }
}

class Profile extends DomUI {
  constructor(playerId) {
    super();
    
    let profile = document.createElement('div');
    profile.className = 'profile';

    let profileImg = document.createElement('img');
    let name = document.createElement('strong');
    let level = document.createElement('span');

    name.className = 'profile-name';
    level.className = 'profile-level';
    
    let lv_value = null;
    //일단 플레이어 캐릭터 3개..
    if (playerId === 1) {
      name.innerText = 'Hector';
      lv_value = 1;
    } else if (playerId === 2) {
      name.innerText = 'Elid';
      lv_value = 2;
    } else {
      name.innerText = 'Miluda';
      lv_value = 10;
    }

    level.innerText = 'LV.' + lv_value;

    this.profile = profile;
    this.name = name;
    this.level = level;

    profileImg.src = `/src/assets/player${playerId}_active.png`;
    profile.style.position = 'absolute';

    this.profile.append(profileImg);
    this.profile.append(level);
    this.profile.append(name);

    this.dom = this.profile;
    this.dom.addEventListener('mouseup', this.showStatUI);
  }
  
}


class SceneTitle extends DomUI {
  constructor(text) {
    super();

    const title = document.createElement('h2');
    title.className = 'stageTitle';
    title.innerText = text;
    this.dom = title;
  }
}

class NineBox extends DomUI {
  constructor ( container, _width, _height, _type ) {
    super();
    
    const nineBox = document.createElement('div');
    nineBox.innerHTML = this.render();
    nineBox.classList.add('pixelBox');

    nineBox.style.width = _width + 'px';
    nineBox.style.height = _height + 'px';

    this.dom = nineBox;

    // modal background image path 변경
    for(let i = 0; i < nineBox.children.length; i++) {
      var pixel = nineBox.children[i];
      let gap;

      if( _type === 'dialog' ) {
        pixel.classList.add('dialog');
        gap = 16;
      } else {
        gap = 26;
      }

      if( pixel.classList.contains('_width')) {
        pixel.style.width = (_width - gap)  + 'px';
      } 
      if ( pixel.classList.contains('_height') ) {
        pixel.style.height = (_height - gap)  + 'px';
      }
    }
  }

  render() {
    return `
        <div class="pixel"></div>
        <div class="pixel _width"></div>
        <div class="pixel"></div>
        <div class="pixel _height"></div>
        <div class="pixel _width _height"></div>
        <div class="pixel _height"></div>
        <div class="pixel"></div>
        <div class="pixel _width"></div>
        <div class="pixel"></div>
     `;
  }
}

class Modal extends DomUI {
  constructor(container, width, height) {
    super();

    this.createDom();

    const modal = new NineBox(this.container, width, height);
    modal.dom.classList.add('modal');

    const closeBtn = new Button('', 'closeBtn');
    
    modal.dom.appendChild(closeBtn.dom);
    this.container.appendChild(modal.dom);

    this.dom = modal.dom;

    closeBtn.dom.addEventListener('click', function(event) {
      modal.dom.parentNode.parentNode.removeChild(modal.dom.parentNode);
    });
  }

  addTitle(text) {
    const title = document.createElement('h1');
    title.innerText = text;
    title.className = 'title';

    this.dom.appendChild(title);
  }
}

class Button extends DomUI {
  constructor (value, type) {
    super();

    const button = document.createElement('button');
    button.innerHTML = value;
    button.style.position = 'absolute';

    if( type !== undefined ) {
      button.classList.add(type); 
    } else {
      button.className = 'button';
    }
    
    this.onclose = null;
    this.dom = button;
  }
}
