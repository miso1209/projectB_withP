import Panel from "./component/panel";
import Modal from "./component/modal";
import ItemImage from "./component/itemimage";
import MakeDom from "./component/makedom";
import Button from "./component/button";
import StatText from "./component/statText";
import StatusBar from "./component/statusbar";



export default class CharacterDetail extends Panel {
  constructor(pane, input, result) {
    super();
    
    pane.classList.add('screen');

    this.selected = input;
    this.statItem = null; 
    this.isActive = null; // 장비, 스킬 아이콘 같이 체크해야함.
    this.pauseData = null; // 캔슬할때 임시로 데이터 담아두기
    this.callback = result;
    this.tempEquipData = null;
    
    // 모달
    const modal = new Modal(pane, 800, 440);
    modal.dom.classList.add('characterDetail');
    modal.addTitle('캐릭터 정보');
    modal.addCloseButton();
    modal.closeBtn.addEventListener('click', this.closeModal.bind(this, 'close'));
    this.dom = modal.dom;

    // 모달 내부 컨텐츠 영역
    const contentsWrap = new MakeDom('div', 'contents');
    contentsWrap.classList.add('flexWrap');
    const leftBox = new MakeDom('div', 'flex-left');
    const characterBox = new MakeDom('div', 'list-detail')
    leftBox.appendChild(characterBox);
    const characterStat = new MakeDom('div', 'characterStat')
    leftBox.appendChild(characterStat);

    const rightBox = new MakeDom('div', 'flex-right');
    rightBox.classList.add('characterDesc');

    contentsWrap.appendChild(leftBox);
    contentsWrap.appendChild(rightBox);

    const titleWrap = new MakeDom('div', 'titleWrap');
    const infoWrap = new MakeDom('div', 'infoWrap');
    const dpsIcon = new MakeDom('div', 'dpsIcon');
    const dpsStatText = new StatText('dps', 'inline');
    dpsIcon.appendChild(dpsStatText);

    this.name = new MakeDom('span', 'stat_name');
    this.level = new MakeDom('span', 'stat_level');
    // this.level.style.paddingRight = '10px';

    this.class = new MakeDom('p', 'stat_class');
    this.dps = new MakeDom('p', 'stat_dps');
    
    // 캐릭터 정보
    const portraitWrap = new MakeDom('div', 'portraitWrap'); 
    this.portrait = new MakeDom('img', 'profile');
    portraitWrap.appendChild(this.portrait);

    titleWrap.appendChild(this.level);
    titleWrap.appendChild(this.name);
    infoWrap.appendChild(dpsIcon);
    infoWrap.appendChild(this.dps);

    const gearBox = new MakeDom('div', 'gearBox');

    // 장비
    this.equipItems = document.createElement('ul');
    this.equipItems.className = 'equipItems';

    // 스킬
    this.skillItems = document.createElement('ul');
    this.skillItems.className = 'skillItems';

    const descBox = new MakeDom('div', 'descBox');
    this.description = new MakeDom('p', 'description');

    const buttonWrap = new MakeDom('div');
    this.equipBtn = new Button('장비장착', 'button_medium');
    this.equipBtn.dom.classList.add('submit');
    this.equipBtn.dom.style.display = 'none';
    this.equipBtn.moveToRight(10);
    this.equipBtn.moveToBottom(10);

    this.cancelBtn = new Button('취소', 'button_small');
    this.cancelBtn.dom.style.display = 'none';
    this.cancelBtn.moveToRight(70);
    this.cancelBtn.moveToBottom(10);

    if (this.equipBtn.dom) {
      this.equipBtn.dom.addEventListener('click', (e)=>{
        this.equipCallback(e.target);
      });
    }

    if (this.cancelBtn.dom) {
      this.cancelBtn.dom.addEventListener('click', (e)=>{
        this.equipCallback(e.target);
      });
    }
    
    buttonWrap.appendChild(this.cancelBtn.dom);
    buttonWrap.appendChild(this.equipBtn.dom);

    descBox.appendChild(buttonWrap);
    descBox.appendChild(this.description);

    // hp, exp 상태바
    const baseStats = new MakeDom('div', 'baseStats');
    this.hp = new StatusBar(0, 10);
    this.hp.name = '체력';
    this.hp.setBar('health');

    this.exp = new StatusBar(0, 10);
    this.exp.name = '경험치';
    this.exp.setBar('exp');

    baseStats.appendChild(this.hp.dom);
    baseStats.appendChild(this.exp.dom);

    const mainStats = new MakeDom('div', 'mainStats');

    const dpsFrag = new MakeDom('section', 'frag');
    const dpsText = new StatText('attack');
    this.statDps = new MakeDom('div', 'statBox', `${this.selected.strongFigure}`);
    this.statDps.classList.add('_atk');
    
    const dpsFrag2 = new MakeDom('section', 'frag');
    const dpsText2 = new StatText('deffence');
    this.statArmor = new MakeDom('div', 'statBox', `${this.selected.armorFigure}`);
    this.statArmor.classList.add('_def');

    dpsFrag.appendChild(dpsText);
    dpsFrag.appendChild(this.statDps);

    dpsFrag2.appendChild(dpsText2);
    dpsFrag2.appendChild(this.statArmor);

    mainStats.appendChild(dpsFrag);
    mainStats.appendChild(dpsFrag2);

    characterBox.appendChild(titleWrap);
    characterBox.appendChild(infoWrap);
    characterBox.appendChild(mainStats);
    characterBox.appendChild(baseStats);

    //.left

    this.statWrap = new MakeDom('ul', 'statWrap');
    // 장착가능 아이템 슬롯 
    this.equipInven = new MakeDom('div', 'equipInven');
    this.equipInven.style.display = 'none';
    
    // 스크롤영역 사이즈
    let scrollHeight = '200px';

    const scrollView = document.createElement('div');
    scrollView.classList.add('scrollView');
    scrollView.style.height = scrollHeight;

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


    characterStat.appendChild(this.statWrap);

    gearBox.appendChild(portraitWrap);
    gearBox.appendChild(this.equipItems);
    gearBox.appendChild(this.skillItems);
    
    rightBox.appendChild(gearBox);
    rightBox.appendChild(descBox);
    rightBox.appendChild(this.equipInven);
    this.dom.appendChild(contentsWrap);
    this.init();
  }

  init() {
    const path = '/src/assets/';
    this.class.innerText = this.selected.class;
    this.name.innerText = this.selected.displayName;
    // this.portrait.src = path + this.selected.data.portrait;
    this.portrait.src = `${path}sprite/${this.selected.name}/${this.selected.name}_idle_sw.png`;
    this.level.innerText = 'Lv.' + this.selected.level;

    // 캐릭터 정보 업데이트
    this.updateEquip();
    this.updateSkill();
    this.updateStat();
    this.updateStatus(this.selected);
  }

  updateStatus(current) {
    this.hp.update(current.health, current.maxHealth);
    this.exp.update(current.exp, current.maxexp);
  }

  updateStat() {
    this.statWrap.innerHTML = '';
    this.dps.innerText = `${this.selected.totalPowerFigure}`;
    this.statDps.innerText = `${this.selected.strongFigure}`;
    this.statArmor.innerText = `${this.selected.armorFigure}`;
    
    // console.log(this.selected);
    for (let base in this.selected.data.base) {
      if ( base !== 'regist') {
        let baseStat = document.createElement('li');
        let plusStat = new MakeDom('span', 'plusStat');
        let text = base.charAt(0).toUpperCase() + base.slice(1);
        let baseStatText = 'base' + text;
        let plusStatText = 'simulated' + text; //simulated
        
        if ( base === 'health') {
          baseStatText = 'baseMax' + text;
          plusStatText = 'simulatedMax' + text;
        }

        let stText = new StatText(base, 'inline');
        baseStat.appendChild(stText);
        let baseValue = new MakeDom('p', 'statvalue', `${this.selected[baseStatText]}`);
        baseStat.appendChild(baseValue);
        plusStat.innerText = `(+${this.selected[plusStatText]})`;

        if (base.includes('critical')) {
          // console.log(base);
          baseValue.innerText = `${this.selected[baseStatText] * 100}%`;
          plusStat.innerText = `(+${this.selected[plusStatText] * 100}%)`;
        }

        baseValue.appendChild(plusStat);
        this.statWrap.appendChild(baseStat);
      }
    }
  }

  updateEquip(){
    this.equipItems.innerHTML = '';
    let index = -1;
    let equipItemsData = [
      {data: null, category: 'armor', displayName: '갑옷'},
      {data: null, category: 'weapon', displayName: '무기'},
      {data: null, category: 'accessory', displayName: '악세사리'}
    ];
    equipItemsData[0].data = this.selected.equipments.armor;
    equipItemsData[1].data = this.selected.equipments.weapon;
    equipItemsData[2].data = this.selected.equipments.accessory;
    
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
        liWrap.appendChild(itemIcon.dom);
      } else {
        liWrap.classList.add('empty');
      }

      this.equipItems.appendChild(liWrap);

      liWrap.addEventListener('click', (e) => {
        if (this.isActive) {
          this.isActive.classList.remove('active');
          this.isActive = liWrap;
        }
        liWrap.classList.add('active');
        this.isActive = liWrap;
        this.statItem = equipItemsData[liWrap.index];
      });
      
      liWrap.addEventListener('click', this.showEquipInfo.bind(this));
    });
  }

  updateSkill() {
    this.skillItems.innerHTML = '';
    let skillItemsData = [];
    skillItemsData.push(this.selected.skillA);
    skillItemsData.push(this.selected.skillB);
    skillItemsData.push(this.selected.skillExtra);
    
    let index = -1;

    skillItemsData.forEach(d => {
      ++index;
      let liWrap = new MakeDom('li');
      liWrap.index = index;

      if (d !== null) {
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
      liWrap.addEventListener('click', this.showSkillInfo.bind(this));
    });
  }

  showSkillInfo (){
    this.description.innerHTML = '';
    this.equipBtn.dom.style.display = 'none';
    this.cancelBtn.dom.style.display = 'none';

    if (this.statItem) {
      this.description.innerText = this.statItem.data.name; 
      const desctext = new MakeDom('p', 'desc-text');
      this.description.appendChild(desctext);
      desctext.innerText = this.statItem.data.description; 
    }
  }

  showEquipInfo() {
    this.description.innerHTML = '';
    this.equipBtn.dom.style.display = 'none';
    this.cancelBtn.dom.style.display = 'none';
    
    const desctext = new MakeDom('p', 'desc-text');
    let status = null;

    if (this.statItem.data !== null) {
      if(this.tempEquipData !== null) { // 시뮬레이션 데이터
        status = 'tempEquip';
      } else { // 실제 장비를 장착하고 잇는 중. 
        status = 'unEquip';
      }
      this.description.innerText = this.statItem.data.name; 
      let desc = new MakeDom('p', 'desc', `${this.statItem.data.description}`);
      
      this.statItem.data.options.forEach(option => {
        let optionText = new MakeDom('em', 'option', `${option}`);
        desctext.appendChild(optionText);
      });

      desctext.appendChild(desc);
    } else {
      desctext.innerText = '장착된 장비 정보가 없습니다.';
      status = 'simulationEquip';
    }
    this.updateInfo(status);
    this.description.appendChild(desctext);
  }

  updateInfo(_status){
    this.equipBtn.dom.style.display = 'none';
    this.cancelBtn.dom.style.display = 'none';

    if( _status === 'simulationEquip' ||  _status === 'cancel' ) {
      this.equipBtn.dom.style.display = 'block';
      this.cancelBtn.dom.style.display = 'none';
      this.equipBtn.dom.innerText = '장비장착';
      this.equipBtn.dom.classList.remove('button_small');
      this.equipBtn.dom.classList.add('button_medium');
      this.equipBtn.dom.classList.add('submit');
      this.equipBtn.dom.setAttribute('value', 'simulationEquip');
    } else if(_status === 'unEquip') {
      this.equipBtn.dom.style.display = 'block';
      this.equipBtn.dom.innerText = '장비해제';
      this.equipBtn.dom.classList.remove('submit');
      this.equipBtn.dom.setAttribute('value', 'unEquip');
    } else if(_status === 'tempEquip') {
      this.equipBtn.dom.style.display = 'block';
      this.cancelBtn.dom.style.display = 'block';
      this.equipBtn.dom.innerText = '장착';
      this.equipBtn.dom.classList.remove('button_medium');
      this.equipBtn.dom.classList.add('button_small');
      this.equipBtn.dom.setAttribute('value', 'equip');
      this.cancelBtn.dom.setAttribute('value', 'cancel');
    } 
  }

  showEquipInven() {
    this.storageContent.innerHTML = '';
    this.equipInven.style.display = 'block';
    this.slotSize = 15;

    let isActive = null;
    let index = -1;

    this.tempEquipData.forEach(item => {
      ++index;

      let liWrap = new MakeDom('li', 'slot');
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
        this.showEquipInfo();
      });

      liWrap.addEventListener('click', this.equipCallback.bind(this, null));
      this.storageContent.appendChild(liWrap);
    });
  }

  hideEquipInven() {
    this.equipInven.style.display = 'none';
  }

  equipCallback(attr) {
    let flag = null;

    if (attr === null) {
      flag = 'simulationEquip';
    } else {
      flag = attr.value;
      
      if (flag === 'equip') {
        this.hideEquipInven();
        this.tempEquipData = null;
      } else if (flag === 'cancel') {
        this.pauseData = this.statItem.data.category;
        this.tempEquipData = null;
        this.hideEquipInven();
      } else if (flag === 'unEquip'){ 
        flag = 'unEquip';
      } 
    }
    this.updateInfo(flag);
    this.callback(this.statItem, flag);
    this.showEquipInfo();
  }

  closeModal(){
    this.callback(this.statItem, 'close');
  }
}
