
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
    btnInventory.dom.addEventListener('click', this.showInventory.bind(this));

    this.gnbContainer.appendChild(profile.dom);
    this.gnbContainer.appendChild(btnInventory.dom);

    document.body.appendChild(this.gnbContainer);
    profile.dom.addEventListener('mouseup', this.showStatUI);
  }

  // gnb 메뉴 배치 / 파티, 인벤토리, 레시피 
  setGNB() {
    const gnb_party = new Button('', 'gnb-party');
    
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

    // list box test
    const wrapper = new Modal(this.container, 360, 460);
    wrapper.addTitle('List Box');
    const items = [{name:'열쇠', image:'item1.png'}, {name:'열쇠', image:'item1.png'}, {name:'열쇠2', image:'item2.png'}, {name:'열쇠3', image:'item3.png'},
    {name:'열쇠', image:'item1.png'}, {name:'열쇠', image:'item1.png'}, {name:'열쇠2', image:'item2.png'}, {name:'열쇠3', image:'item3.png'},
    {name:'열쇠', image:'item1.png'}, {name:'열쇠', image:'item1.png'}, {name:'열쇠2', image:'item2.png'}, {name:'열쇠3', image:'item3.png'}];

    const itemList = new ListBox(items, null, 320, 320);
    itemList.dom.style.top = '80px';

    wrapper.dom.appendChild(itemList.dom);
  }

  showInventory() {
    const inventory = new Modal(this.container, 360, 460);
    inventory.addTitle('Inventory');
    
    // # 인벤 탭 영역 작업예정
    const wrapper = document.createElement('div');
    wrapper.classList.add('categoryWarp');
    const category = [{catName:'전체', catID: 0 }, {catName:'갑옷', catID: 1}, {catName:'무기', catID: 2}, {catName:'악세사리', catID: 3}];
    category.forEach((cat) => {
      const catBtn = new Button(cat.catName, 'category');
      catBtn.dom.style.left = 90*cat.catID + 10 + 'px';
      wrapper.appendChild(catBtn.dom);
    })

    inventory.dom.appendChild(wrapper);
    wrapper.style.top = '80px';

    // # stat
    const statContent = document.createElement('div');
    statContent.classList.add('contents');
    statContent.style.textAlign = 'left';
    statContent.style.top = wrapper.clientHeight + 100 + 'px';
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

  showTooltip(target, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    target.appendChild(tooltip);
    setTimeout(() => {
      target.removeChild(tooltip);
    }, 1000);
  }

  showStatUI() {
    const statUI = new Modal(this.container, 360, 460);
    statUI.addTitle('Player Status');
    statUI.className = 'statUI';

    // 캐릭터 정보
    let playerId = 1;
    const profile = new Profile(playerId);
    profile.moveToCenter(50);
    statUI.dom.appendChild(profile.dom);
    

    // 캐릭터 스탯 정보 - 임시..
    let statData = [];
    const contents = document.createElement('div');
    contents.classList.add('contents');
    contents.classList.add('column-2'); // 3단으로 할 때는 column-3
    contents.style.top = profile.dom.offsetTop + 130 + 'px';

    statData.push("HP : 33");
    statData.push("MP : 3");
    statData.push("STRENGTH : 10");
    statData.push("DEFFENSE : 300");
    statData.push("RANGE : 100");
    statData.push("SPEED : 200");
    statData.push("RANGE : 100");
    statData.push("SPEED : 200");
    statData.push("RANGE : 100");
    statData.push("SPEED : 200");
    
    statData.forEach(text => {
      let stat = document.createElement('p');
      stat.innerText = text;
      contents.appendChild(stat);
    });

    // 현재 캐릭터 장비정보
    const equipItemsData = [{x:12, y:6, item:'Wond'}, {x:20,y:2,item:'Armor'}, {x:10, y:10,item:'Ring'}];
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
    this.dom.style.left = '0px';
    this.dom.style.right = '0px';
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

  showDialog(script, callback) {
    const dialog = new Dialog(700, 140, script);

    dialog.setText(script[0].text);
    dialog.showSpeaker(script[0].speaker);
    dialog.onComplete = callback;
  }
}


class Dialog extends DomUI {
  constructor(width, height, script) {
    super();
   
    this.createDom();
    this.container.style.pointerEvents = 'auto'; // 클릭 이벤트 방지.
    
    const dialog = new NineBox(this.container, width, height, 'dialog');
    dialog.dom.className = 'dialog';
    dialog.moveToBottom(20);
    this.container.appendChild(dialog.dom);
    this.dom = dialog.dom;

    // dialogText
    const dialogText = document.createElement('p');
    this.dialogText = dialogText;
    this.dialogText.classList.add('contents');
    this.dom.appendChild(this.dialogText);

    // 캐릭터
    const speaker = document.createElement('img');
    speaker.className = 'dialog-speaker';
    dialog.dom.appendChild(speaker);
    this.speaker = speaker;

    // 캐릭터이름
    const speakerName = document.createElement('span');
    speakerName.className = 'name';
    dialog.dom.appendChild(speakerName);
    this.speakerName = speakerName;
    
    // 프람프트 
    const prompt = document.createElement('div');
    prompt.className = 'dialog-prompt';
    dialog.dom.appendChild(prompt);
    this.prompt = prompt;

    this.delay = 0.5;

    // 종료시 호출될 함수
    this.onComplete = null;

    if (script !== null) {
      this.data = script;
      this.endIndex = this.data.length-1;
      this.currentIndex = 0;
    }

    dialog.dom.addEventListener('click', this.nextDialog.bind(this));
  }

  nextDialog() {
    if (this.currentIndex === this.endIndex) {
      this.hideDialog();
      
      // 다이얼로그 종료 함수!
      if (this.onComplete) {
        this.onComplete();
      }
      return;
    } 

    ++this.currentIndex;

    this.dialogText.classList.remove('blinkAnim');
    this.hidePrompt();

    setTimeout(() => {
      this.setText(this.data[this.currentIndex].text);
      this.showSpeaker(this.data[this.currentIndex].speaker);
    }, this.delay*1000);
  }

  hidePrompt() {
    this.prompt.style.display = 'none';
  }

  showPrompt() {
    this.prompt.style.display = 'block';
  }

  showSpeaker(id) {
    if (id === 0) {
      this.dom.classList.remove('portrait');
      return;
    }

    this.dom.classList.add('portrait');
    this.speaker.src = `/src/assets/player${id}.png`;
    this.speakerName.innerText = 'Hector'; // todo - player name
  }

  setText(text) {
    if (this.dialogText.innerText !== '') {
      this.dialogText.innerText = '';
    }
    this.dialogText.classList.add('blinkAnim');
    this.dialogText.innerText = text;
    this.showPrompt();
  }

  hideDialog(){
    this.container.style.pointerEvents = 'none'; // 클릭 이벤트 방지.
    this.dom.parentNode.parentNode.removeChild(this.dom.parentNode);
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

    for (let i = 0; i < nineBox.children.length; i++) {
      var pixel = nineBox.children[i];
      let gap;

      if (_type === 'dialog') {
        pixel.classList.add('dialog');
        gap = 16;
      } else {
        gap = 26;
      }

      if (pixel.classList.contains('_width')) {
        pixel.style.width = (_width - gap)  + 'px';
      } 
      if (pixel.classList.contains('_height')) {
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

    this.dom = modal.dom;
    this.container.appendChild(modal.dom);

    closeBtn.dom.addEventListener('click', function(event) {
      modal.dom.parentNode.parentNode.removeChild(modal.dom.parentNode);
    });
  }

  addTitle(text) {
    const title = document.createElement('h1');
    title.innerText = text;
    title.className = 'title';
    this.dom.id = text;
    this.dom.appendChild(title);
  }
}

class Button extends DomUI {
  constructor (value, type) {
    super();

    const button = document.createElement('button');
    const btnText = document.createElement('span');
    btnText.innerText = value;
    btnText.style.textShadow = '1px 2px 2px #444'

    button.appendChild(btnText);
    button.style.position = 'absolute';

    if( type !== undefined ) {
      button.classList.add(type); 
    } else {
      button.className = 'button';
    }

    this.dom = button;
  }
}

class ListBox extends DomUI {
  constructor(data, listCallback, _viewWidth, _viewHeight) {
    super();
    
    let viewHeight = _viewHeight + 'px';
    let viewWidth = _viewWidth + 'px';

    // IE 스크롤바 이슈 대응
    const scrollView = document.createElement('div');
    scrollView.className = 'scrollView';
    

    const scrollBlind = document.createElement('div');
    scrollBlind.className = 'scrollBlind';
    scrollBlind.style.height = viewHeight;
    scrollBlind.style.width = viewWidth + '20px';

    scrollView.style.height = viewHeight;
    scrollView.style.width = viewWidth;

    const listBox = document.createElement('ul');
    listBox.classList.add('list-box');
    listBox.style.height = viewHeight;
    listBox.style.width = viewWidth;

    data.forEach((listCell) => {
      listCell = document.createElement('li');
      listBox.appendChild(listCell);

      if (listCallback!== null) {
        listCell.addEventListener('click', listCallback);
      }
    });
    
    scrollView.appendChild(scrollBlind);
    scrollBlind.appendChild(listBox);

    this.dom = scrollView;
  }
// todo list-cell 스타일도 변경되도록.
  
}