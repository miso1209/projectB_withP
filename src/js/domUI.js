export default class DomUI {
  constructor(game) {
    this.game = game;
    this.gamePane = document.getElementById('Game');
    this.screenWidth = this.gamePane.screenWidth;
    this.screenHeight = this.gamePane.screenHeight;
    this.stageMode = 'normal';
  }

  create() {
    console.log('-- DomUI --');
    const container = document.createElement('div');
    container.className = 'uiContainer';
    container.style.top = this.gamePane.offsetTop + 'px';
    document.body.appendChild(container);

    this.preventEvent(container);
    // container.style.pointerEvents = 'auto'; // 클릭 이벤트.
    return container;
  }

  preventEvent(container, clickable) {
    let iscClickable = clickable;

    if (clickable === undefined) {
      iscClickable = 'auto'; // 타일클릭 가능
    }

    container.style.pointerEvents = iscClickable; // 클릭 이벤트.
  }

  setStageMode(stage) {
    document.body.className = stage;
    this.stageMode = stage;

    console.log('current stage mode: ' + this.stageMode);
  }

  setProfile(playerId) {
    const profile = new Profile(playerId);
    profile.name.style.display = 'none';
    profile.level.style.display = 'none';
    profile.moveToLeft(20);
    profile.dom.style.top = '20px';

    const btnInventory = new Button('', 'btnInventory');
    btnInventory.dom.style.top = '20px';
    btnInventory.dom.style.right = '20px';

    this.gnbContainer.appendChild(profile.dom);
    this.gnbContainer.appendChild(btnInventory.dom);

    profile.dom.addEventListener('click', this.showStatUI.bind(this));
    btnInventory.dom.addEventListener('click', this.showInventory.bind(this));
  }

  // gnb 메뉴 배치 / 파티, 인벤토리, 레시피 
  setGNB() {
    const gnb_party = new Button('', 'gnb-party');

    this.gnbContainer = document.createElement('div');
    this.gnbContainer.className = 'gnbContainer';
    this.gnbContainer.style.top = this.gamePane.offsetTop + 'px';
    this.gnbContainer.style.opacity = '1';
    document.body.appendChild(this.gnbContainer);

    this.setProfile(1);
  }

  showItemAquire(itemId) {
    const pane = this.create();
    const itemAcquire = new Modal(pane, 360, 300);
    itemAcquire.addTitle('NEW ITEM');
    itemAcquire.addCloseButton();

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

    itemText.innerText = acquireText;
    itemAcquire.dom.appendChild(itemText);

    const itemSprite = document.createElement('img');
    itemSprite.src = '/src/assets/items/item' + itemId + '.png';
    itemSprite.style.position = 'absolute';
    itemSprite.style.left = (itemAcquire.dom.clientWidth / 2 - 36) + 'px';
    itemSprite.style.top = itemText.offsetTop + itemText.offsetHeight + 50 + 'px';

    itemAcquire.dom.appendChild(itemSprite);
  }


  showInventory() {
    const pane = this.create();
    pane.classList.add('screen');

    const inventory = new Modal(pane, 360, 460);
    inventory.addTitle('인벤토리');
    inventory.addCloseButton();

    this.tabs = [
      {category: 'weapon'},
      {category: 'armor'},
      {category: 'accessory'},
      {category: 'material'},
      {category: 'consumables'},
      {category: 'valuables'}
    ];
    
    this.select = null;

    inventory.addTab(this.tabs, this.tabs[0].category, this.select);

    // # stat
    const statContent = document.createElement('div');
    statContent.classList.add('contents-box');
    statContent.style.textAlign = 'left';

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
    const playerInven = this.game.player.inventory.items;
    if (playerInven.length < 0) {
      return
    }

    // this.game.player.inventory.eachItem((item) => {
    for (const item of playerInven.items) {
      const itemSprite = document.createElement('img');
      itemSprite.src = '/src/assets/items/' + item.image;
      itemSprite.style.width = '50px';

      const slot = document.createElement('li');
      slot.appendChild(itemSprite);
      storageContent.appendChild(slot);
      slot.style.height = '50px';

      slot.addEventListener('click', function (event) {
        if (selectedSlot) {
          selectedSlot.classList.remove('active');
        }
        slot.classList.add('active');
        selectedSlot = slot;

        // 위에 도큐먼트를 추가한다
        while (statContent.hasChildNodes()) {
          statContent.removeChild(statContent.firstChild);
        }
        let stat = document.createElement('p');
        stat.innerText = item.description;
        statContent.appendChild(stat);
      });
    }
    // });

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
    const pane = this.create();
    pane.classList.add('screen');
    const statUI = new Modal(pane, 360, 460);
    statUI.addTitle('플레이어 정보');
    statUI.addCloseButton();
    statUI.className = 'statUI';

    // 캐릭터 정보
    let playerId = 1;
    const profile = new Profile(playerId);
    profile.moveToCenter(50);
    statUI.dom.appendChild(profile.dom);


    // 캐릭터 스탯 정보 - 임시..
    let statData = [];
    const contents = document.createElement('div');
    contents.classList.add('contents-box');
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
    const equipItemsData = [{
      x: 12,
      y: 6,
      item: 'Wond'
    }, {
      x: 20,
      y: 2,
      item: 'Armor'
    }, {
      x: 10,
      y: 10,
      item: 'Ring'
    }];
    
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
    const skillItemData = [{
      x: 1,
      y: 6,
      skill: 'Die'
    }, {
      x: 4,
      y: 6,
      skill: 'Mad'
    }, {
      x: 2,
      y: 6,
      skill: 'poison'
    }];
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
      itemIcon.style.backgroundPositionX = (item.x * 32) + 'px';
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
    const pane = this.create();
    const title = new SceneTitle(text);
    pane.appendChild(title.dom);

    title.dom.classList.add('stageTitle');
    title.dom.classList.add('animate');

    setTimeout(() => {
      title.dom.style.opacity = 0;
      // this.pane.removeChild(title.dom);
      this.remove(pane);
    }, delay);
  }

  moveToCenter(_top) {
    this.dom.style.position = 'absolute';
    this.dom.style.left = '0px';
    this.dom.style.right = '0px';
    this.dom.style.margin = `${_top}px auto 0`;
  }

  moveToLeft(_left) {
    this.dom.style.position = 'absolute';
    this.dom.style.left = `${_left}px`;
    // this.dom.style.top = `${_left}px`;
  }

  moveToRight(_right) {
    this.dom.style.position = 'absolute';
    this.dom.style.right = `${_right}px`;
  }

  moveToBottom(_bottom) {
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

  remove(dom) {
    dom.parentNode.removeChild(dom);
  }

  showDialog(script, callback) {
    const dialog = new Dialog(700, 140, script);

    dialog.setText(script[0].text);
    dialog.showSpeaker(script[0].speaker);
    dialog.onComplete = callback;
  }

  showConfirmModal(text, result) {
    const confirmModal = new SystemModal(300, 200, text, result);
    confirmModal.dom.style.top = '50%';
    confirmModal.dom.style.marginTop = 200 * -0.5 + 'px';
    confirmModal.contents.style.fontSize = '1.1rem';
    confirmModal.contents.style.margin = '10% auto 0';
  }

  showLoading(time, onComplete) {
    // 로딩속도(interval 함수 호출 시간)
    const pane = this.create();
    const loading = new ProgressUI(pane, time, onComplete);
    loading.moveToCenter(200);
  }

  // 레시피 + 아이템 조합창
  showCombineItemList(inputs, callback) { // 제작하기 버튼 콜백
    const pane = this.create();
    pane.classList.add('screen');

    this.recipeUI = new RecipeUI(pane, 360, 460, callback);
  
    for (const input of inputs) {
      this.recipeUI.tabs.push({category: input.category});
      this.recipeUI.inputs = inputs;
    }

    if (inputs.length > 0) {
      this.recipeUI.select(inputs[0].category);
    }
    // this.recipeUI.update();
    this.recipeUI.moveToLeft(150);
  }
}
//. DomUI



class RecipeUI extends DomUI {
  constructor(pane, width, height, callback) {
    super();

    this.recipeModal = new Modal(pane, width, height);
    this.recipeModal.addCloseButton();
    this.recipeModal.addTitle('아이템 레시피');
    this.combinerUI = null;

    this.pane = pane;
    this.dom = this.recipeModal.dom;
    this.callback = callback;
    this.category = null;
    this.recipes = null;
    this.tabs = [];

    this.list = new ListBox(320, 320, this.listCallback.bind(this));
    this.list.dom.style.top = '100px';
    this.dom.appendChild(this.list.dom);
  }

  select(category) {
    for(const input of this.inputs) {
      if (input.category === category) {
        this.category = input.category;
        this.recipes = input.recipes;
      }
    }
    
    this.update();
  }

  update(){
    this.recipeModal.setSubTitle(this.category);
    this.list.update(this.recipes);
    this.recipeModal.addTab(this.tabs, this.category, this.select.bind(this));

    if(this.recipes.length > 0) {
      // 아이템 조합창
      this.combinerUI = new CombinerUI(this.pane, 360, 460, this.onCombine.bind(this));
      this.combinerUI.moveToRight(100);
      
      // 최초실행 시 제일 처음 레시피 데이터로 업데이트
      this.updateCombiner(this.recipes[0]);
    } else {
      if ( this.combinerUI !== null ){
        this.remove(this.combinerUI.dom);
        this.combinerUI = null;
      }
    }
  }

  updateCombiner(data){
    this.combinerUI.recipe = data;
    this.combinerUI.update();
  }

  listCallback(data){
    this.combinerUI.recipe = data;
    this.combinerUI.update();
  }

  onCombine(combine){
    if(combine) {
      console.log('RecipeUI--' + combine);
      this.callback(combine);
    }
  }
}


class CombinerUI extends DomUI {
  constructor(pane, width, height, callback) {
    super();
    
    const combineModal = new Modal(pane, width, height);
    this.dom = combineModal.dom;
    this.callback = callback;

    this.recipe = null;
    this.materialsData = null;

    const contents = document.createElement('div');
    contents.classList.add('contents');
    contents.classList.add('combineItemInfo');

    const combineItem = document.createElement('div');
    combineItem.className = 'combineItem';

    this.itemName = document.createElement('div');
    this.itemName.className = 'title';

    this.itemDesc = document.createElement('p');
    this.itemDesc.className = 'itemDesc';

    this.itemImg = new ItemImage('items@2.png', 21, 14);
    this.itemImg.dom.classList.add('itemImg');

    combineItem.appendChild(this.itemImg.dom);
    combineItem.appendChild(this.itemDesc);
    contents.appendChild(this.itemName);
    contents.appendChild(combineItem);

    // 아이템 옵션
    this.options = document.createElement('ul');
    this.options.classList.add('options');

    // 재료 리스트
    this.materialInfo = document.createElement('ul');
    this.materialInfo.classList.add('materialInfo');
    
    const combineButton = new Button('제작');
    combineButton.moveToCenter(10);
    combineButton.moveToBottom(15);
    combineButton.dom.classList.add('disabled');
    
    this.button = combineButton.dom;

    contents.appendChild(this.options);
    contents.appendChild(this.materialInfo);

    this.dom.appendChild(contents);
    this.dom.appendChild(combineButton.dom);
  }

  update() {
    if (this.recipe !== null) {
      if (this.recipe.available === 1) {
        this.button.classList.remove('disabled');
        this.button.classList.add('isAvailable');

        this.button.addEventListener('click', this.doCombineItem.bind(this));
      }

      // 기존데이터 초기화
      this.materialInfo.innerHTML = '';
      this.options.innerHTML = '';

      // this.recipe.data
      this.itemImg.updateImage(this.recipe.data.image.x, this.recipe.data.image.y);
      this.itemName.innerText = this.recipe.data.name;
      this.itemDesc.innerText = this.recipe.data.description;
      this.materialsData = this.recipe.materials;
  
      // 아이템 효과는 배열로 전달된다.
      for (const option of this.recipe.data.options ) {
        let node = document.createElement('li');
        node.className = 'li';
        node.innerText = option.toString();
        this.options.appendChild(node);
      }
      
      this.materialsData.forEach(mat => {
        let node = document.createElement('li');
        node.className = 'li';

        let material1 = new ItemImage(mat.data.image.texture, mat.data.image.x, mat.data.image.y);
        let material2 = document.createElement('p');
        let material3 = document.createElement('p');
  
        material2.innerText = `${mat.data.name}`;
        material3.innerText = `${mat.owned} / ${mat.count}`;

        node.appendChild(material1.dom);
        node.appendChild(material2);
        node.appendChild(material3);
  
        this.materialInfo.appendChild(node);
      });
    } 
  }

  doCombineItem() {
    this.remove(this.dom.parentNode);
    this.callback(this.recipe);
  }
}

class ItemImage {
  constructor(texture, x, y) {
    const imageSprite = document.createElement('div');
    this.size = 32;

    if ((texture.toString()).includes('@2')) {
      this.size = this.size * 2;
    }

    imageSprite.classList.add('img');
    imageSprite.style.backgroundImage = `url(/src/assets/items/${texture})`;
    imageSprite.style.display = 'inline-block';
    imageSprite.style.width = `${this.size}px`;
    imageSprite.style.height = `${this.size}px`;
    
    imageSprite.style.backgroundPositionX = -(x * this.size) + 'px';
    imageSprite.style.backgroundPositionY = -(y * this.size) + 'px';
    
    this.positionX = 0;
    this.positionY = 0;

    this.dom = imageSprite;
  }

  updateImage(x, y){
    this.dom.style.backgroundPositionX = -(x * this.size) + 'px';
    this.dom.style.backgroundPositionY = -(y * this.size) + 'px';
  }
}


class SystemModal extends DomUI {
  constructor(width, height, text, callback) {
    super();
    this.pane = this.create();
    this.pane.classList.add('screen');

    const confirmModal = new Modal(this.pane, width, height);
    confirmModal.dom.id = 'SYSTEM';

    const descText = document.createElement('p');
    descText.className = 'contents';
    descText.innerText = text;
    confirmModal.dom.appendChild(descText);

    this.contents = descText;
    this.callback = callback;

    const okButton = new Button('OK', 'submit');
    const cancelButton = new Button('CANCEL');

    confirmModal.dom.appendChild(okButton.dom);
    confirmModal.dom.appendChild(cancelButton.dom);

    okButton.moveToLeft(20);
    cancelButton.moveToRight(20);
    okButton.moveToBottom(20);
    cancelButton.moveToBottom(20);

    okButton.dom.addEventListener('click', this.onSubmit.bind(this));
    cancelButton.dom.addEventListener('click', this.onCancel.bind(this));

    this.response = null;
    this.dom = confirmModal.dom;
  }

  onSubmit() {
    this.onclose();
    this.callback('ok');
  }
  onCancel() {
    this.onclose();
    this.callback('cancel');
  }
  onclose() {
    this.dom.parentNode.parentNode.removeChild(this.dom.parentNode);
  }
}

class Dialog extends DomUI {
  constructor(width, height, script) {
    super();

    this.pane = this.create();

    const dialog = new NineBox(this.pane, width, height, 'dialog');
    dialog.dom.className = 'dialog';
    dialog.moveToBottom(20);
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

    if (script !== null) {
      this.data = script;
      this.endIndex = this.data.length;
      this.currentIndex = 0;
    }

    this.onComplete = null;
    this.dom.addEventListener('click', this.nextDialog.bind(this));
  }

  nextDialog(event) {
    event.preventDefault();

    if (this.currentIndex < 0) {
      return;
    }

    if (this.dialogText.classList.contains('blinkAnim')) {
      return;
    } else {
      ++this.currentIndex;
      if (this.currentIndex === this.endIndex) {
        this.hideDialog();

        if (this.onComplete !== null) {
          this.onComplete();
          this.onComplete = null;
        }
        this.currentIndex = -1;
        this.dom.removeEventListener('click', this.nextDialog, true);

        return;
      }
      this.setText(this.data[this.currentIndex].text);
      this.showSpeaker(this.data[this.currentIndex].speaker);
    }
  }

  hidePrompt() {
    this.prompt.style.display = 'none';
  }

  showPrompt() {
    this.prompt.style.display = 'block';
  }

  showSpeaker(id) {
    if (id === 0) { // system dialog
      this.dom.classList.remove('portrait');
      return;
    }

    
    this.dom.classList.add('portrait');
    this.speaker.src = `/src/assets/player${id}.png`;
    this.speakerName.innerText = '헥터'; // todo - player name
  }

  setText(text) {
    this.dialogText.classList.add('blinkAnim');
    this.hidePrompt();
    this.dialogText.innerText = text;

    setTimeout(() => {
      if (this.dialogText.classList.contains('blinkAnim')) {
        this.dialogText.classList.remove('blinkAnim');
        this.showPrompt();
      }
    }, 700);
  }

  hideDialog() {
    this.pane.parentNode.removeChild(this.pane);
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
  constructor(pane, _width, _height, _type) {
    super();

    const nineBox = document.createElement('div');
    nineBox.innerHTML = this.render();
    nineBox.classList.add('pixelBox');
    nineBox.style.width = _width + 'px';
    nineBox.style.height = _height + 'px';

    this.dom = nineBox;
    pane.appendChild(this.dom);

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
        pixel.style.width = (_width - gap) + 'px';
      }
      if (pixel.classList.contains('_height')) {
        pixel.style.height = (_height - gap) + 'px';
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
  constructor(pane, width, height) {
    super();
    this.pane = pane;
    const modal = new NineBox(this.pane, width, height);
    this.dom = modal.dom;
    this.dom.classList.add('modal');
  }

  addCloseButton() {
    const closeBtn = new Button('', 'closeBtn');
    this.dom.appendChild(closeBtn.dom);
    this.closeBtn = closeBtn;
    closeBtn.dom.addEventListener('click', this.closeModal.bind(this));
  }
  
  addTitle(text) {
    const title = document.createElement('h1');
    title.innerText = text;
    title.className = 'title';
    this.dom.id = text;
    this.dom.appendChild(title);

    this.subTitle = document.createElement('h2');
    this.subTitle.innerText = text;
    this.subTitle.className = 'sub-title';
    this.dom.appendChild(this.subTitle);
    this.subTitle.style.display = 'none';
  }

  setSubTitle(text) {
    this.subTitle.innerText = text;
    this.subTitle.style.display = 'block';
  }

  closeModal() {
    this.pane.removeChild(this.dom);
    this.remove(this.pane);
  }

  addTab(tabs, category, callback) {
    if (this.dom.querySelector('.tabPane') !== null) {
      return;
    }
    const tabPane = document.createElement('ul');
    tabPane.classList.add('tabPane');
    this.dom.appendChild(tabPane);

    tabPane.style.zIndex = '1';
    tabPane.style.width = '100px;'
    
    let selected = null;
    this.callback = callback;

    tabs.forEach(tab => {
      let tabButton = new Tab(tab, callback);
      tabButton.dom.classList.add('tabBtn');
      tabButton.active = false;

      tabPane.appendChild(tabButton.dom);

      if (tab.category === category) {
        tabButton.dom.classList.add('active');
        selected = tabButton.dom;
      }

      tabButton.dom.addEventListener('click', function() {
        if (selected) {
          selected.classList.remove('active');
        }
        tabButton.dom.classList.add('active');
        selected = tabButton.dom;
      });
    });
  }

  callback(category) {
    return category;
  }
}

// 탭 클래스를 추가한다.
class Tab {
  constructor(tab, callback) {
    const iconMap = [
      {category: 'weapon', x:19, y:9},
      {category: 'armor', x:4, y:12},
      {category: 'accessory', x:11, y:3},
      {category: 'material', x:11, y:4},
      {category: 'consumables', x:5, y:3},
      {category: 'valuables', x:3, y:2}
    ];

    const tabButton = document.createElement('li');
    const tabImg = new ItemImage('items.png', 10, 10);
    
    for (const icon of iconMap) {
      if (icon.category === tab.category) {
        tabImg.updateImage(icon.x, icon.y);
        this.category = icon.category;
      }
    }
   
    this.dom = tabButton;
    this.callback = callback;

    tabButton.appendChild(tabImg.dom);
    this.dom.addEventListener('click', this.onclick.bind(this));
  }

  onclick(){
    if(this.callback !== null) {
      this.callback(this.category);
    }
  }
}

class Button extends DomUI {
  constructor(value, type) {
    super();

    const button = document.createElement('button');
    const btnText = document.createElement('span');
    btnText.innerText = value;
    btnText.style.textShadow = '1px 2px 2px #444'

    button.appendChild(btnText);
    button.style.position = 'absolute';

    if (type !== undefined) {
      button.classList.add(type);
    } else {
      button.className = 'button';
    }

    this.dom = button;
  }
}


class ListCell {
  constructor(cellData, cellType){
    this.cell = document.createElement('li');
    this.cell.classList.add('list-cell');
    this.cell.classList.add('disabled');

    this.cellData = cellData;
    this.index = null;

    // 타입별로 리스트의 셀 스타일을 교체함.
    if ( cellType === 'recipe') {
      this.showRecipeCell();
    }
  }

  showRecipeCell() {
    if (this.cellData.available === 1) {
      this.cell.classList.remove('disabled');
      this.cell.classList.add('isAvailable');

      this.cell.addEventListener('click', this.onclick.bind(this));
    }

    const imgData = this.cellData.data.image;
    this.cellImg = new ItemImage(imgData.texture, imgData.x, imgData.y);
    
    this.cellData1 = document.createElement('p');
    this.cellData2 = document.createElement('p');
    this.cellData3 = document.createElement('p');

    this.cellData1.innerText = this.cellData.data.name;
    this.cellData2.innerText = this.cellData.owned;
    this.cellData3.className = 'availableIcon';

    this.cell.appendChild(this.cellImg.dom);
    this.cell.appendChild(this.cellData1);
    this.cell.appendChild(this.cellData2);
    this.cell.appendChild(this.cellData3);
  }

  onclick(){
    console.log(this.index);
  }
}

// 현재는 리스트형태 / 갤러리도 추가할 것.
class ListBox extends DomUI {
  constructor(_viewWidth, _viewHeight, callback) {
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

    this.list = document.createElement('ul');
    this.list.classList.add('list-box');
    this.list.style.height = viewHeight;
    this.list.style.width = viewWidth;

    scrollView.appendChild(scrollBlind);
    scrollBlind.appendChild(this.list);

    this.dom = scrollView;
    this.callback = callback;
  }

  update (recipes) {
    if (recipes.length < 1) {
      this.list.innerHTML = '해당 카테고리 레시피가 없습니다.';
      return;
    } else {
      this.list.innerHTML = '';

      let selectedCell = null;
      let index = -1;
      for (const recipe of recipes) {
        let listCell = new ListCell(recipe, 'recipe');
        
        ++index;
        listCell.index = index;
        listCell.available = recipe.available;
  
        if (listCell.index === 0) {
          listCell.cell.classList.add('active');
          selectedCell = listCell.cell;
        }
  
        listCell.cell.addEventListener('click', function () {
          if (selectedCell) {
            selectedCell.classList.remove('active');
          }
          listCell.cell.classList.add('active');
          selectedCell = listCell.cell;
        });
        listCell.cell.addEventListener('click', this.setRecipe.bind(this, recipe));
        this.list.appendChild(listCell.cell);
      }
    }
  }

  setRecipe(data){
    this.callback(data);
  }
}

class ProgressUI extends DomUI {
  constructor(container, time, onComplete) {
    super();
    this.pane = container;
    this.pane.classList.add('loadingScene');

    const statusHolder = document.createElement('div');
    statusHolder.classList.add('progressHolder');
    statusHolder.id = 'progressHolder';

    const bar = document.createElement('div');
    bar.classList.add('progressbar');
    statusHolder.appendChild(bar);
    this.progressBar = bar;

    const percentage = document.createElement('p');
    percentage.className = 'progressRate'
    bar.appendChild(percentage);

    this.progress = 1;
    this.interval = 5;

    this.timer = null;
    this.percentage = percentage;
    this.pane.appendChild(statusHolder);
    this.dom = statusHolder;

    this.update(time);
    this.onComplete = onComplete;
  }

  update(time) {
    this.timer = setInterval(() => {
      ++this.progress;

      this.progressBar.style.width = this.progress * this.interval + '%';
      this.percentage.innerText = this.progress * this.interval + '%';
      this.clearTimer();
    }, time);
  }

  clearTimer() {
    if (this.progress * this.interval === 60) {
      clearInterval(this.timer);
      this.onComplete('loading_complete');
      // this.hideLoading();
    }
  }

  hideLoading() {
    setTimeout(() => {
      this.pane.classList.remove('loadingScene');
      this.pane.removeChild(this.dom);
    }, 600);
  }
}