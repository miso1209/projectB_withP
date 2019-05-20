export default class DomUI {
  constructor(game) {
    this.game = game;
    this.gamePane = document.getElementById('canvas');
    this.screenWidth = this.gamePane.screenWidth;
    this.screenHeight = this.gamePane.screenHeight;
    this.stageMode = 'normal';
    this.gnbContainer = null;
    this.theaterUI = null;
  }

  create() {
    const container = document.createElement('div');
    container.className = 'uiContainer';
    container.style.top = this.gamePane.offsetTop + 'px';
    document.body.appendChild(container);
    this.preventEvent(container);

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
    // console.log('current stage mode: ' + this.stageMode);
  }

  setProfile(playerId) {
    const profile = new Profile(playerId);
    profile.name.style.display = 'none';
    profile.level.style.display = 'none';
    profile.moveToLeft(20);
    profile.dom.style.top = '20px';

    // const btnInventory = new Button('', 'btnInventory');
    // btnInventory.dom.style.top = '20px';
    // btnInventory.dom.style.right = '20px';
    this.gnbContainer.appendChild(profile.dom);
    // this.gnbContainer.appendChild(btnInventory.dom);

    profile.dom.addEventListener('click', this.showStatUI.bind(this));
    // btnInventory.dom.addEventListener('click', this.showInventory.bind(this));
  }

  // gnb 메뉴 배치 / 파티, 인벤토리, 레시피 
  setGNB() {
    if(this.gnbContainer === null) {
      this.gnbContainer = document.createElement('div');
      this.gnbContainer.className = 'gnbContainer';
      this.gnbContainer.style.top = this.gamePane.offsetTop + 'px';
      this.gnbContainer.style.opacity = '1';
      document.body.appendChild(this.gnbContainer); 

      const gnb = document.createElement('div');
      gnb.className = 'gnb';
      this.gnbContainer.appendChild(gnb);

      const menuData = [
        {menu:'보관함', method: this.showInventory.bind(this)},
        {menu:'퀘스트', method: null},
        {menu:'설정', method: null}
      ];
      
      menuData.forEach(menu => {
        let btn = new Button(menu.menu, 'tabBtn');
        gnb.appendChild(btn.dom);
        btn.dom.addEventListener('click', menu.method);
      });

      this.setProfile(1);
    }
  }

  showItemAquire(itemId, result) {
    const pane = this.create();
    const itemAcquire = new Modal(pane, 360, 300, result);
    itemAcquire.addTitle('NEW ITEM');
    itemAcquire.addCloseButton();
    itemAcquire.addConfirmButton('확인');

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
    itemSprite.style.top = itemText.offsetTop + itemText.offsetHeight / 2 + 25 + 'px';

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
    // let inventorySize = 4 * 4;
    let selectedSlot = null;

    // inventory items
    const playerInven = this.game.player.inventory;
    console.log(playerInven);
    
    this.game.player.inventory.eachItem((item) => {
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
      let itemIcon = new ItemImage('items.png', item.x, item.y);
      itemIcon.className = 'stat-item';

      let itemName = document.createElement('span');
      itemName.innerText = item.item;

      itemIcon.dom.style.display = 'inline-block';
      itemIcon.dom.append(itemName);
      equipItems.appendChild(itemIcon.dom);
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
      let itemIcon = new ItemImage('items.png', item.x, item.y);

      itemIcon.className = 'stat-item';

      let itemName = document.createElement('span');
      itemName.innerText = item.skill;

      itemIcon.dom.style.display = 'inline-block';
      itemIcon.dom.append(itemName);
      skillItems.appendChild(itemIcon.dom);
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
    this.pane = this.create();
    const dialog = new Dialog(this.pane, 700, 140, script);

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
    loading.isLoading = true;
    loading.moveToCenter(200);
  }

  showCraftUI(itemId, result) {
    const pane = this.create();
    const modal = new Modal(pane, 360, 300);

    modal.addTitle('아이템 조합중');
    modal.addCloseButton();
    modal.addConfirmButton('조합완료');

    const itemText = document.createElement('div');
    itemText.className = 'contents';
    itemText.innerText = "아이템을 조합중";
    itemText.style.top = '60px';

    const loading = new ProgressUI(modal.dom, 2, (onComplete)=>{
      console.log('progress-complete');
      itemText.innerText = "아이템 조합 성공!"

      modal.result = () => {
        this.remove(pane);
        result(1);
      }
    });

    loading.moveToCenter(130);
    modal.dom.appendChild(itemText);
    modal.dom.appendChild(loading.dom);
  }

  showCombineModal(text, result) {
    const confirmModal = new Modal(300, 200, text, result);
    confirmModal.dom.style.top = '50%';
    confirmModal.dom.style.marginTop = 200 * -0.5 + 'px';
    confirmModal.contents.style.fontSize = '1.1rem';
    confirmModal.contents.style.margin = '10% auto 0';
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
    this.recipeUI.moveToLeft(150);
  }

  showTheaterUI(duration){
    if (this.theaterUI === null) {
      this.theaterUI = document.createElement('div');
      this.theaterUI.id = 'theater';
      this.theaterUI.style.top = this.gamePane.offsetTop + 'px';
      this.theaterUI.classList.add('show');
      this.theaterUI.style.transition = `background ${duration}s ease ${duration}s`;
      document.body.appendChild(this.theaterUI);
    }
  }

  hideTheaterUI(duration){
    this.theaterUI.style.transition = `background ${duration}s ease ${duration}s`;
    this.theaterUI.classList.remove('show');
    document.body.removeChild(this.theaterUI);
    this.theaterUI = null;
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

    this.list = new ListBox(320, 320, this.updateCombiner.bind(this));
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

  onCombine(combine){
    if(combine) {
      this.callback(combine);
      this.onClose();
    }
  }

  onClose() {
    this.remove(this.pane);
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

    this.button.removeEventListener('click', this.doCombineItem.bind(this));
  }

  update() {
    if (this.recipe !== null) {
      if (this.recipe.available === 1) {
        this.button.classList.remove('disabled');
        this.button.classList.add('isAvailable');
        this.button.addEventListener('click', this.doCombineItem.bind(this));
      } else {
        this.button.classList.add('disabled');
        this.button.classList.remove('isAvailable');
        this.button.removeEventListener('click', this.doCombineItem.bind(this));
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
    if(this.recipe !== null) {
      this.callback(this.recipe);
      this.recipe = null;
    }
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
  constructor(pane, width, height, script) {
    super();

    this.pane = pane;

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
  constructor(pane, width, height, result) {
    super();
    this.pane = pane;
    const modal = new NineBox(this.pane, width, height);
    this.dom = modal.dom;
    this.dom.classList.add('modal');
    this.result = result;
  }

  addCloseButton() {
    const closeBtn = new Button('', 'closeBtn');
    this.dom.appendChild(closeBtn.dom);
    this.closeBtn = closeBtn;
    closeBtn.dom.addEventListener('click', this.closeModal.bind(this));
  }

  addConfirmButton(text) {
    const confirmBtn = new Button(text);
    this.dom.appendChild(confirmBtn.dom);
    this.confirmBtn = confirmBtn;
    confirmBtn.moveToCenter(0);
    confirmBtn.moveToBottom(20);
    confirmBtn.dom.addEventListener('click', this.onConfirm.bind(this));
  }

  onConfirm(){
    if (this.result !== null) {
      this.result('onConfirm - ok');
    }
    // this.closeModal();
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

  update (listData) {
    if (listData.length < 1) {
      this.list.innerHTML = '해당 카테고리 레시피가 없습니다.';
      return;
    } else {
      this.list.innerHTML = '';

      let selectedCell = null;
      let index = -1;

      for (const data of listData) {
        ++index;

        let listCell = new ListCell(data, 'recipe');
        listCell.available = data.available;
        listCell.index = index;

        if (index === 0) {
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
        listCell.cell.addEventListener('click', this.setData.bind(this, data));
        this.list.appendChild(listCell.cell);
      }
    }
  }

  setData(data){
    this.callback(data);
  }
}

class ProgressUI extends DomUI {
  constructor(container, interval, onComplete) {
    super();
    this.pane = container;
    this.pane.classList.add('loadingScene');

    // dom
    const holder = document.createElement('div');
    holder.classList.add('progressHolder');
    holder.id = 'progressHolder';

    const bar = document.createElement('div');
    bar.classList.add('progressbar');
    holder.appendChild(bar);
    this.progressBar = bar;

    const rate = document.createElement('p');
    rate.className = 'progressRate'
    bar.appendChild(rate);

    this.progress = 1;
    this.interval = interval;

    this.timer = null;
    this.rate = rate;
    this.isLoading = false;
    this.pane.appendChild(holder);
    this.dom = holder;
   
    this.onComplete = onComplete;
    this.update();
  }

  update() {
    this.timer = setInterval(() => {

      if (this.progress * this.interval === 100) {

        clearInterval(this.timer);
  
        this.onComplete('loading_complete');
        this.timer = null;
        this.isLoading = false;
      } else {
        ++this.progress;
        this.isLoading = true;
        this.progressBar.style.width = this.progress * this.interval + '%';
        this.rate.innerText = this.progress * this.interval + '%';
      }
    }, 100);
  }

  hide() {
    this.pane.classList.remove('loadingScene');
    this.pane.removeChild(this.dom);
  }
}