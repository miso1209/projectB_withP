
export default class DomUI {
  constructor() {
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

    this.gnbContainer.className = 'gnbContainer';
    this.gnbContainer.style.top = this.gamePane.offsetTop + 'px';
    
    profile.moveToLeft(20);

    const btnInventory = new Button('', 'btnInventory');
    btnInventory.dom.style.top = '20px';
    btnInventory.dom.style.right = '20px';
    btnInventory.onClick = null;
    btnInventory.dom.addEventListener('click', this.showInventory);

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
    
    console.log(itemText.offsetTop + itemText.offsetHeight);

    itemAcquire.dom.appendChild(itemSprite);
  }


  showCombineItemList(){
    // todo 조합가능한 아이템 리스트 노출
  }


  showInventory() {
    const inventory = new Modal(this.container, 360, 460);
    inventory.addTitle('Inventory');
    
    const categoryWrap = document.createElement('div');
    categoryWrap.classList.add('contents');
    categoryWrap.classList.add('categoryWarp')
    
    // stat effect
    const statContent = document.createElement('div');
    statContent.classList.add('contents');
    statContent.classList.add('column-2');
    statContent.style.top = categoryWrap.clientHeight + 100 + 'px';
    
    let itemStatData = [];
    // 임시
    itemStatData.push("HP  +33");
    itemStatData.push("MP   -3");
    itemStatData.push("STRENGTH  +10");
    
    itemStatData.forEach(text => {
      let stat = document.createElement('p');
      stat.innerText = text;
      statContent.appendChild(stat);
    });

    inventory.dom.appendChild(statContent);

    // inventory items
    const storageContent = document.createElement('ul');
    storageContent.classList.add('contents-list');
    storageContent.style.top = statContent.clientHeight + 100 + 'px';

    let inventorySize = 4 * 4;
    let slot;
    
    const itemSprite = document.createElement('img');
    itemSprite.src = '/src/assets/items/item1.png';
    itemSprite.style.width = '50px';

    for (let i = 0; i < inventorySize; i++) {
      slot = document.createElement('li');

      // 일단 하드코딩.... 
      if (i === 0) {
        slot.appendChild(itemSprite);
      }
      
      storageContent.appendChild(slot);
      
      slot.addEventListener('click', function(event){
        // event.target.nextSibling.classList.remove('active');
        event.target.classList.toggle('active');
      });
    }
    inventory.dom.appendChild(storageContent);
  }

  showGear (catID) {
    let catText;

    if (catID === 0) {
      catText = 'Gear';
    } else if (catID == 1) {
      catText = 'Item';
    } else {
      catText = 'Item';
    }
  }

  showTooltip(container, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';

    container.appendChild(tooltip);
  }

  // todo : 탭...? Stat / Gear / Items / Skills 
  showStatUI() {
    const statUI = new Modal(this.container, 400, 250);
    statUI.addTitle('Player Status');

    // stat data
    let statData = [];

    const contents = document.createElement('div');
    contents.classList.add('contents');
    contents.classList.add('column-2');
    
    // 임시
    statData.push("HP : 33/100");
    statData.push("MP : 3/100");
    statData.push("STRENGTH : 1/100");
    statData.push("DEFFENSE : 33/100");
    statData.push("RANGE : 10/100");
    statData.push("SPEED : 2/100");
    
    statData.forEach(text => {
      let stat = document.createElement('p');
      stat.innerText = text;
      contents.appendChild(stat);
    });
    const skill = new Button('SKILL');
    skill.moveToRight(20);
    skill.moveToBottom(20);
    skill.dom.classList.add('_small');
    skill.dom.style.margin = '0 auto';

    statUI.dom.appendChild(skill.dom);
    
    // skill / 
    statUI.dom.appendChild(contents);
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

  moveToCenter(){
    this.dom.style.position = 'absolute';
    this.dom.style.left = 0 + 'px';
    this.dom.style.right = 0 + 'px';
    this.dom.style.margin = '10% auto';
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

  showDialog(text) {
    const dialog = new Dialog(900, 140);
    dialog.setText(text);
  }

  hideDialog() {
    this.destroyDom();
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

    this.profile = document.createElement('img');
    let name;
    
    //일단 플레이어 캐릭터 3개..
    if (playerId === 1) {
      name = 'Hector';
    } else if (playerId === 2) {
      name = 'Elid';
    } else {
      name = 'Miluda';
    }

    this.name = name;

    this.profile.src = `/src/assets/player${playerId}_active.png`;
    this.profile.style.position = 'absolute';
    
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
