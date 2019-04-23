
export default class DomUI {
  constructor() {
    this.gamePane = document.getElementById('Game');
    this.screenWidth = this.gamePane.screenWidth;
    this.screenHeight = this.gamePane.screenHeight;
    
    this.UIlayers = [];
  }

  createDom() {
    console.log('-- DomUI --');
    const container = document.createElement('div');
    container.className = 'uiContainer';
    container.style.top = this.gamePane.offsetTop + 'px';

    document.body.appendChild(container);

    this.container = container;
    this.UIlayers.push(this.container.node);
    this.container.style.pointerEvents = 'none'; // 클릭 이벤트 방지 해제.
    // this.container.style.pointerEvents = 'auto'; // 클릭 이벤트 방지.
  }

  destroyDom(delay){
    setTimeout(() => {
      document.body.removeChild(this.container);
    }, delay);
  }

  showItemAquire(itemId){
    const itemAcquire = new Modal(this.container, 400, 300);
    itemAcquire.addTitle('NEW ITEM');

    let acquireText;
    const itemText = document.createElement('p');
    itemText.className = 'contents';

    if (itemId === 1) {
        acquireText = "[열쇠조각A]를 얻었다";
    } else if (itemId === 2) {
        acquireText = "[열쇠조각B]를 얻었다";
    } else if (itemId === 3) {
        acquireText = "[철문열쇠]를 얻었다";
    }

    itemText.innerHTML = acquireText;

    const itemSprite = document.createElement('img');
    itemSprite.src = '/src/assets/items/item' + itemId + '.png';
    itemSprite.style.position = 'absolute';
    itemSprite.style.left = itemAcquire.dom.clientWidth/2 - itemSprite.clientWidth/2+ 'px'; 
    
    itemAcquire.dom.appendChild(itemSprite);
    itemAcquire.dom.appendChild(itemText);

    itemSprite.style.top = itemText.offsetTop + 80 + 'px';
  }

  showInventory() {
    const inventory = new Modal(this.container, 240, 300);
    inventory.addTitle('Inventory');
  }

  moveToCenter(){
    this.dom.style.position = 'absolute';
    this.dom.style.left = 0 + 'px';
    this.dom.style.right = 0 + 'px';
    this.dom.style.margin = '10% auto';
  }

  moveToLeft(){
    this.dom.style.position = 'absolute';
    this.dom.style.left = 0 + 'px';
  }

  moveToRight(){
    this.dom.style.position = 'absolute';
    this.dom.style.right = '20px';
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
    
    console.dir(this.dom);
  }

  addChild(_dom){
    this.container.appendChild(_dom);
    document.body.appendChild(this.container);
  }

  showChatBallon(character, text, duration) {
    const chat = new ChatBallon2(character, text);
    this.container.appendChild(chat);
    // this.chatBallons.push(chat);
    duration = duration || 3;

    setTimeout(() => {
        this.removeChild(chat);
        const index = this.chatBallons.indexOf(chat);
        if (index >= 0) {
            this.chatBallons.splice(index, 1);
        }
    }, duration * 1000);
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
    
    this.dom = modal.dom;
    
    modal.dom.appendChild(closeBtn.dom);
    this.container.appendChild(this.dom);

    closeBtn.dom.addEventListener('click', function() {
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

    this.dom = button;
  }

}
