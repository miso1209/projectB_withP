
export default class DomUI {
  constructor() {
    this.gamePane = document.getElementById('Game');
    this.screenWidth = this.gamePane.screenWidth;
    this.screenHeight = this.gamePane.screenHeight;
    
    this.gnbContainer = document.createElement('div');
    this.container = document.createElement('div');

    this.UIlayers = [];
  }

  createDom() {
    console.log('-- DomUI --');

    this.container.className = 'uiContainer';
    this.container.style.top = this.gamePane.offsetTop + 'px';

    document.body.appendChild(this.container);
    this.UIlayers.push(this.container.node);
    this.container.style.pointerEvents = 'none'; // 클릭 이벤트 방지 해제.
    // this.container.style.pointerEvents = 'auto'; // 클릭 이벤트 방지.
  }

  destroyDom(delay){
    setTimeout(() => {
      document.body.removeChild(this.container);
    }, delay);
  }

  setProfile(playerId) {
    const profile = new Profile(playerId);

    this.gnbContainer.className = 'gnbContainer';
    this.gnbContainer.style.top = this.gamePane.offsetTop + 'px';
    // this.gnbContainer.style.left = this.gamePane.offsetLeft + 'px';
    
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

  showInventory() {
    const inventory = new Modal(this.container, 360, 340);
    inventory.addTitle('Inventory');

    const contents = document.createElement('ul');
    contents.classList.add('contents-list');
    
    let inventorySize = 4 * 4;
    let slot;
    let slotSize = 70;
    
    const itemSprite = document.createElement('img');
    itemSprite.src = '/src/assets/items/item1.png';
    itemSprite.style.width = '50px';

    for (let i = 0; i < inventorySize; i++) {
      slot = document.createElement('li');
      slot.style.width = slotSize;
      
      if (i === 0) {
        slot.appendChild(itemSprite);
      }

      contents.appendChild(slot);
    }

    inventory.dom.appendChild(contents);
  }

  showStatUI() {
    const statUI = new Modal(this.container, 400, 250);
    statUI.addTitle('Player Status');
    statUI.moveToLeft(20);

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

  moveToBottom(){
    this.dom.style.position = 'absolute';
    this.dom.style.bottom = 0 + 'px';
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
  constructor ( container, _width, _height) {
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
    
      if( pixel.classList.contains('_width')) {
        pixel.style.width = (_width - 26)  + 'px';
      } 
      if ( pixel.classList.contains('_height') ) {
        pixel.style.height = (_height - 26)  + 'px';
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
    modal.dom.className = 'modal';
    modal.moveToRight();

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
