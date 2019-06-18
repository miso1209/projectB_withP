import Panel from "./component/panel";
import Modal from "./component/modal";
import ItemImage from "./component/itemimage";
import MakeDom from "./component/makedom";
import Button from "./component/button";

export default class CharacterDetail extends Panel {
  constructor(pane, input, result) {
    super();
    
    pane.classList.add('screen');

    this.selected = input;
    this.statItem = null;
    this.isActive = null;
    this.callback = result;
    this.simulationData = null;

    // 모달
    const modal = new Modal(pane, 800, 460);

    modal.addTitle('캐릭터 정보');
    modal.addCloseButton();
    modal.dom.classList.add('characterDetail');
    this.dom = modal.dom;

    // 모달 내부 컨텐츠 영역
    const contentsWrap = new MakeDom('div', 'contents');
    contentsWrap.classList.add('flexWrap');
    contentsWrap.style.top = '80px';

    const leftBox = new MakeDom('div');
    const rightBox = new MakeDom('div');

    leftBox.classList.add('flex-left');
    leftBox.classList.add('characterDesc');

    rightBox.classList.add('flex-right');
    rightBox.classList.add('characterStat');
    rightBox.classList.add('contents-box');

    leftBox.style.width = '50%';
    rightBox.style.width = '50%';
    rightBox.style.height = '340px';
    
    const titleWrap = new MakeDom('div', 'titleWrap');
    const infoWrap = new MakeDom('div', 'infoWrap');

    this.descName = new MakeDom('span', 'stat_name');
    this.level = new MakeDom('span', 'stat_level');
    this.level.style.paddingRight = '10px';

    this.class = new MakeDom('p', 'stat_class');
    this.dps = new MakeDom('p', 'stat_dps');
    this.dps.style.paddingTop = '10px';

    // 캐릭터 정보
    this.portrait = new MakeDom('img', 'profile');
    this.portrait.style.display = 'block';
    this.portrait.style.margin = '30px auto 10px';

    titleWrap.appendChild(this.level);
    titleWrap.appendChild(this.descName);
    infoWrap.appendChild(this.portrait);
    infoWrap.appendChild(this.class);
    infoWrap.appendChild(this.dps);

    // 캐릭터 정보
    const profile = new MakeDom('img', 'profile');
    profile.src = 'src/assets/' + this.selected.data.portrait;

    // 장비
    this.equipItems = document.createElement('ul');
    this.equipItems.className = 'equipItems';

    // 스킬
    this.skillItems = document.createElement('ul');
    this.skillItems.className = 'skillItems';

    const descBox = new MakeDom('div', 'descBox');
    this.descEquip = new MakeDom('p', 'description');

    const buttonWrap = new MakeDom('div');
    this.equipBtn = new Button('장비장착', 'buttonS');
    this.equipBtn.dom.style.display = 'none';
    this.equipBtn.moveToRight(10);
    this.equipBtn.moveToBottom(10);

    this.cancelBtn = new Button('취소', 'buttonS');
    this.cancelBtn.dom.style.display = 'none';
    this.cancelBtn.moveToRight(110);
    this.cancelBtn.moveToBottom(10);

    if (this.equipBtn.dom) {
      this.equipBtn.dom.addEventListener('click', (e)=>{
        this.equipCallback(e.target);
      });
    }

    if (this.equipBtn.dom) {
      this.cancelBtn.dom.addEventListener('click', (e)=>{
        this.equipCallback(e.target);
      });
    }
    
    buttonWrap.appendChild(this.cancelBtn.dom);
    buttonWrap.appendChild(this.equipBtn.dom);

    descBox.appendChild(buttonWrap);
    descBox.appendChild(this.descEquip);
    //.left

    this.statWrap = new MakeDom('ul', 'statWrap');
    const mainStats = new MakeDom('div', 'mainStat');

    this.statMagic = new MakeDom('span', 'stat', `마법 : ${this.selected.magic}`);
    this.statAttack = new MakeDom('span', 'stat', `공격력 : ${this.selected.attack}`);
    this.statArmor = new MakeDom('span', 'stat', `방어력 : ${this.selected.armor}`);

    // 장착가능 아이템 슬롯 
    // 장착버튼 클릭 시 노출된다.
    this.equipInven = new MakeDom('div', 'equipInven');
    this.equipInven.style.display = 'none';
    
    let scrollHeight = '200px';
    let scrollWidth = '340px';

    const scrollView = document.createElement('div');
    scrollView.classList.add('scrollView');
    scrollView.style.height = scrollHeight;
    scrollView.style.width = scrollWidth;

    const scrollBlind = document.createElement('div');
    scrollBlind.className = 'scrollBlind';
    scrollBlind.style.height = scrollHeight;

    this.storageContent = document.createElement('ul');
    this.storageContent.classList.add('slot-list-box');
    this.storageContent.classList.add('scrollbox');
    this.storageContent.style.height = scrollHeight;

    scrollView.appendChild(scrollBlind);
    scrollBlind.appendChild(this.storageContent);
    this.equipInven.appendChild(scrollView);

    
    leftBox.appendChild(descBox);
    mainStats.appendChild(this.statMagic);
    mainStats.appendChild(this.statAttack);
    mainStats.appendChild(this.statArmor);
    rightBox.appendChild(mainStats);

    leftBox.appendChild(titleWrap);
    leftBox.appendChild(infoWrap);

    leftBox.appendChild(this.equipItems);
    leftBox.appendChild(this.skillItems);
    rightBox.appendChild(this.statWrap);

    contentsWrap.appendChild(leftBox);
    contentsWrap.appendChild(rightBox);
    contentsWrap.appendChild(this.equipInven);

    this.dom.appendChild(contentsWrap);
    this.update();
  }



  update() {
    const path = '/src/assets/';

    this.class.innerText = this.selected.class;
    this.descName.innerText = this.selected.displayName;
    this.portrait.src = path + this.selected.data.portrait;
    this.level.innerText = 'Lv.' + this.selected.level;
    this.dps.innerText = `전투력 : ${this.selected.strongFigure}`;

    // 캐릭터 정보 업데이트
    this.updateEquip();
    this.updateSkill();
    this.updateStat();
  }

  updateStat() {
    this.statMagic.innerText = `마법 : ${this.selected.magic}`;
    this.statAttack.innerText = `공격력 : ${this.selected.attack}`;
    this.statArmor.innerText = `방어력 : ${this.selected.armor}`;

    for (let base in this.selected.data.base) {
      if ( base !== 'regist') {
        let baseStat = document.createElement('li');
        let plusStat = document.createElement('span');

        let text = base.charAt(0).toUpperCase() + base.slice(1);
        let baseStatText = 'base' + text;
        let plusStatText = 'plus' + text; //simulated
        
        if ( base === 'health') {
          baseStatText = 'baseMax' + text;
          plusStatText = 'plusMax' + text;
        }

        baseStat.innerText = `${base} : ${this.selected[baseStatText]}`;

        plusStat.innerText = `( + ${this.selected[plusStatText]} )`;
        plusStat.style.paddingLeft = '10px';
        plusStat.style.color = '#ffd800';

        baseStat.appendChild(plusStat);
        this.statWrap.appendChild(baseStat);
      }
    }
  }

  updateEquip(){
    // console.log('updateEquip---');
    this.equipItems.innerHTML = '';
    
    //장착하고 있는 아이템정보와 별개로, 장착가능한 장비정보를 인벤에서 로드해야하므로 카테고리인자값이 필요함. 
    let equipItemsData = [
      {data: null, category: 'armor'},
      {data: null, category: 'weapon'},
      {data: null, category: 'accessory'}
    ];

    equipItemsData[0].data = this.selected.equipments.armor;
    equipItemsData[1].data = this.selected.equipments.weapon;
    equipItemsData[2].data = this.selected.equipments.accessory;

    let index = -1;

    equipItemsData.forEach(d => {
      ++index;

      let liWrap = new MakeDom('li');
      let descText = new MakeDom('span', 'descText', '');

      liWrap.appendChild(descText);
      liWrap.index = index;

      if (d.data !== null) {
        let item = d.data.data;
        let itemIcon = new ItemImage(item.image.texture, item.image.x, item.image.y);

        itemIcon.dom.style.display = 'inline-block';
        descText.innerText = item.name;
        liWrap.appendChild(itemIcon.dom);
      } else {
        liWrap.classList.add('empty');
        descText.innerText = '장비없음';
      }

      this.equipItems.appendChild(liWrap);
      
      // #click event - style
      liWrap.addEventListener('click', (e) => {
        if (this.isActive) {
          this.isActive.classList.remove('active');
          this.isActive = liWrap;
        }
        liWrap.classList.add('active');
        this.isActive = liWrap;

        this.statItem = equipItemsData[liWrap.index];
      });

      // // #click event - data
      liWrap.addEventListener('click', this.showDescription.bind(this, 'gear'));
    });
  }


  updateSkill(){
    this.skillItems.innerHTML = '';
    let skillItemsData = [];
    skillItemsData.push(this.selected.skillA);
    skillItemsData.push(this.selected.skillB);
    skillItemsData.push(this.selected.skillExtra);
    
    let index = -1;

    skillItemsData.forEach(d => {
      ++index;
      let liWrap = new MakeDom('li', null, null);
      liWrap.index = index;

      if (d !== null) {
        console.log(skillItemsData[liWrap.index]);

        let skillIcon = new ItemImage('items.png', 20, 1);
        skillIcon.dom.style.display = 'inline-block';

        let descText = new MakeDom('span', 'descText', skillItemsData[liWrap.index].data.name);
        liWrap.appendChild(skillIcon.dom);
        liWrap.appendChild(descText);

        this.skillItems.appendChild(liWrap);
      } 

      liWrap.addEventListener('click', () => {
        if (this.isActive) {
          this.isActive.classList.remove('active');
          this.isActive = liWrap;
        }
        liWrap.classList.add('active');
        this.isActive = liWrap;
        this.statItem = skillItemsData[liWrap.index];
      });

      liWrap.addEventListener('click', this.showDescription.bind(this, 'skill'));
    });
  }

  showDescription(input) {
    console.log('=== updateDesc');
    // 초기화
    this.descEquip.innerHTML = '';
    
    const desctext = new MakeDom('p', 'desc-text');
    let d = this.statItem;

    if (input === 'gear') {
      this.equipBtn.dom.style.display = 'block';

      if (d.data === null) {
        desctext.innerText = '장착된 장비 정보가 없습니다.';
        this.equipBtn.dom.innerText = '장비장착';
        this.equipBtn.dom.setAttribute('value', 'simulation');
      } else {
        this.descEquip.innerText = d.data.name; 
        desctext.innerText = d.data.description;
        this.equipBtn.dom.innerText = '장비해제';
        this.equipBtn.dom.setAttribute('value', 'unEquip');
      }
    } else {
      this.equipBtn.dom.style.display = 'none';
      this.descEquip.innerText = d.data.name; 
      desctext.innerText = d.data.description; 
    }
    
    this.descEquip.appendChild(desctext);
  }

  updateDescItem() {
    console.log(this.statItem);

    // 초기화
    this.descEquip.innerHTML = '';
    const desctext = new MakeDom('p', 'desc-text');
    desctext.innerText = this.statItem.data.description;
    this.descEquip.innerText = this.statItem.data.name;

    this.cancelBtn.dom.style.display = 'block';
    this.equipBtn.dom.style.display = 'block';

    this.cancelBtn.dom.setAttribute('value', 'cancel');
    this.equipBtn.dom.innerText = '확인';
    this.equipBtn.dom.setAttribute('value', 'equip');
    this.descEquip.appendChild(desctext);
  }

  showEquipInven() {
    this.equipInven.style.display = 'block';
    this.slotSize = 14;

    console.log(this.simulationData);

    let isActive = null;
    this.simulationData.forEach(item => {
      let liWrap = new MakeDom('li', 'slot');
      liWrap.style.width = '55px';
      liWrap.style.height = '55px';

      let itemIcon = new ItemImage(item.data.image.texture, item.data.image.x, item.data.image.y);
      itemIcon.dom.style.display = 'inline-block';
      liWrap.appendChild(itemIcon.dom);

      liWrap.addEventListener('click', ()=>{
        if(isActive) {
          isActive.classList.remove('active');
        }
        isActive = liWrap;
        liWrap.classList.add('active');
        
        this.statItem = item;
      });

      liWrap.addEventListener('click', this.updateDescItem.bind(this));
      liWrap.addEventListener('dblclick', this.callback.bind(this, item, 'equip'));
      this.storageContent.appendChild(liWrap);
    });
  }
  hideEquipInven() {
    this.equipInven.innerHTML = '';
    this.equipInven.style.display = 'none';
    this.cancelBtn.dom.style.display = 'none';
  }

  equipCallback (attr) {
    if (attr.value === 'equip') {
      console.log('equipCallback');
      
    } else if (attr.value === 'cancel') {
      this.hideEquipInven();
    }

    this.callback(this.statItem, attr.value);
    // this.updateEquip();
  }
}


