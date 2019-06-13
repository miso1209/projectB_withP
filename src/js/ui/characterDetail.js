import Panel from "./component/panel";
import Modal from "./component/modal";
import ItemImage from "./component/itemimage";
import MakeDom from "./component/makedom";
import Button from "./component/button";

export default class CharacterDetail extends Panel {
  constructor(pane, input, result) {
    super();

    const statUI = new Modal(pane, 800, 460);
    pane.classList.add('screen');

    statUI.addTitle('캐릭터 정보');
    statUI.addCloseButton();
    statUI.dom.classList.add('characterDetail');

    this.selected = input;
    this.currentEquip = null;
    this.isActive = null;
    this.result = result;

    const contentsWrap = document.createElement('div');
    contentsWrap.classList.add('contents');
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
    
    const titleWrap = new MakeDom('div', 'titleWrap', null);
    const infoWrap = new MakeDom('div', 'infoWrap', null);

    this.descClass = new MakeDom('span', 'stat_class', null);
    this.descName = new MakeDom('span', 'stat_name', null);
    this.level = new MakeDom('span', 'stat_level', null);
    this.level.style.paddingRight = '10px';

    // 캐릭터 정보
    this.portrait = new MakeDom('img', 'profile');
    this.portrait.style.display = 'block';
    this.portrait.style.margin = '30px auto 10px';

    titleWrap.appendChild(this.level);
    titleWrap.appendChild(this.descClass);
    infoWrap.appendChild(this.portrait);

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

    this.equipBtn = new Button('장비교체', 'buttonS');
    this.equipBtn.dom.style.display = 'none';
    this.equipBtn.moveToRight(10);
    this.equipBtn.moveToBottom(10);
    
    // 장비교체 버튼이 있으면. 현재 선택된게 장비면.
    if (this.equipBtn.dom) {
      this.equipBtn.dom.addEventListener('click', ()=>{
        this.result(this.currentEquip.category);
      });
    }

    descBox.appendChild(this.equipBtn.dom);
    descBox.appendChild(this.descEquip);
    //.left

    // 캐릭터 스탯 정보 - 임시..
    const statWrap = new MakeDom('ul', 'statWrap');
    const mainStats = new MakeDom('div', 'mainStat');

    let statMagic = new MakeDom('span', 'stat', `마법 : ${this.selected.magic}`);
    let statAttack = new MakeDom('span', 'stat', `공격력 : ${this.selected.attack}`);
    let statArmor = new MakeDom('span', 'stat', `방어력 : ${this.selected.armor}`);

    leftBox.appendChild(descBox);
    mainStats.appendChild(statMagic);
    mainStats.appendChild(statAttack);
    mainStats.appendChild(statArmor);
    statWrap.appendChild(mainStats);

    for(let base in this.selected.data.base) {
      if ( base !== 'health') {
        let baseStat = document.createElement('li');
        let plusStat = document.createElement('span');

        let text = base.charAt(0).toUpperCase() + base.slice(1);
        let baseStatText = 'base' + text;
        let plusStatText = 'plus' + text;

        baseStat.innerText = `${base} : ${this.selected[baseStatText]}`;
        plusStat.innerText = `( + ${this.selected[plusStatText]} )`;
        plusStat.style.paddingLeft = '10px';
        plusStat.style.color = '#ffd800';

        baseStat.appendChild(plusStat);
        statWrap.appendChild(baseStat);
      }
    }

    leftBox.appendChild(titleWrap);
    leftBox.appendChild(infoWrap);
    leftBox.appendChild(this.equipItems);
    leftBox.appendChild(this.skillItems);
    rightBox.appendChild(statWrap);

    contentsWrap.appendChild(leftBox);
    contentsWrap.appendChild(rightBox);

    statUI.dom.appendChild(contentsWrap);
    this.dom = statUI.dom;

    this.update();
  }

  update() {
    const path = '/src/assets/';
    this.descClass.innerText = this.selected.data.displayname;
    this.descName.innerText = this.selected.name;
    this.portrait.src = path + this.selected.data.portrait;
    this.level.innerText = 'Lv.' + this.selected.level;

    this.addEquipItems();
    this.updateSkill();
  }

  addEquipItems(){

    let data = {input: 'equip', data: null, category: null};
    let equipItemsData = [];

    equipItemsData.push(this.selected.equipments.armor);
    equipItemsData.push(this.selected.equipments.weapon);
    equipItemsData.push(this.selected.equipments.accessory);

    const ARMOR = 0;
    const WEAPON = 1;
    const ACCESSORY = 2;

    let index = -1;

    equipItemsData.forEach(d => {
      ++index;

      let liWrap = new MakeDom('li', null, null);
      liWrap.index = index;

      let descText = new MakeDom('span', 'descText', '');
      liWrap.appendChild(descText);

      if (d !== null) {
        let itemIcon = new ItemImage(d.data.image.texture, d.data.image.x, d.data.image.y);
        itemIcon.dom.style.display = 'inline-block';
        descText.innerText = d.data.name;
        liWrap.appendChild(itemIcon.dom);
        data.data = d.data;
      } else {
        liWrap.classList.add('empty');
        descText.innerText = '장비없음';
      }
      this.equipItems.appendChild(liWrap);

      // #click event
      liWrap.addEventListener('click', () => {
        if (this.isActive) {
          this.isActive.classList.remove('active');
          this.isActive = liWrap;
        }
        liWrap.classList.add('active');

        this.isActive = liWrap;
        this.currentEquip = data;
        
        if (liWrap.index === ARMOR) {
          data.category = 'armor';
        } else if (liWrap.index === WEAPON) {
          data.category = 'weapon';
        } else if (liWrap.index === ACCESSORY) {
          data.category = 'accessory';
        } else {
          data.category = null;
        }
      });

      liWrap.addEventListener('click', this.updateDesc.bind(this, data));
    });
    
  }

  updateEquip(equipItemsData){
    this.equipItems.innerHTML = '';
    
    let data = {input: 'equip', data: null, category: null};

    const ARMOR = 0;
    const WEAPON = 1;
    const ACCESSORY = 2;

    equipItemsData.forEach(d => {
      let liWrap = new MakeDom('li', null, null);
      liWrap.index = index;

      let descText = new MakeDom('span', 'descText', '');
      liWrap.appendChild(descText);

      if (d !== null) {
        let itemIcon = new ItemImage(d.data.image.texture, d.data.image.x, d.data.image.y);
        itemIcon.dom.style.display = 'inline-block';

        descText.innerText = d.data.name;
        liWrap.appendChild(itemIcon.dom);
        data.data = d.data;
      } else {
        liWrap.classList.add('empty');
        descText.innerText = '장비없음';
      }
      
      this.equipItems.appendChild(liWrap);

      // #click event
      liWrap.addEventListener('click', () => {
        if (this.isActive) {
          this.isActive.classList.remove('active');
          this.isActive = liWrap;
        }
        liWrap.classList.add('active');

        this.isActive = liWrap;
        this.currentEquip = data;
        
        if (liWrap.index === ARMOR) {
          data.category = 'armor';
        } else if (liWrap.index === WEAPON) {
          data.category = 'weapon';
        } else if (liWrap.index === ACCESSORY) {
          data.category = 'accessory';
        } else {
          data.category = null;
        }
      });
      liWrap.addEventListener('click', this.updateDesc.bind(this, data));
    });
    
  }

  updateSkill(){
    this.skillItems.innerHTML = '';

    let data = {input: 'skill', data: null, name: null};
    let skillItemsData = [];

    skillItemsData.push(this.selected.skillA);
    skillItemsData.push(this.selected.skillB);
    skillItemsData.push(this.selected.skillExtra);
    
    let index = -1;
    skillItemsData.forEach(d => {
      
      console.dir(d);

      ++index;
      let liWrap = new MakeDom('li', null, null);
      liWrap.index = index;

      if (liWrap.index === 0) {
        data.name = this.selected.skills.a;
      } else if (liWrap.index === 1) {
        data.name = this.selected.skills.b;
      } else if (liWrap.index === 2) {
        data.name = this.selected.skills.extra;
      } else {
        data.name = null;
      }

      if (d !== null) {
        let skillIcon = new ItemImage('items.png', 20, 1);
        skillIcon.dom.style.display = 'inline-block';

        let descText = new MakeDom('span', 'descText', data.name);
        liWrap.appendChild(skillIcon.dom);
        liWrap.appendChild(descText);

        this.skillItems.appendChild(liWrap);
        
        liWrap.addEventListener('click', () => {
          if (this.isActive) {
            this.isActive.classList.remove('active');
            this.isActive = liWrap;
          }
          liWrap.classList.add('active');
          this.isActive = liWrap;

          data.data = d.data;
        });
      }

      liWrap.addEventListener('click', this.updateDesc.bind(this, data));
    });
  }

  updateDesc(d) {
    this.descEquip.innerHTML = '';
    const desctext = new MakeDom('p', 'desc-text');

    if (d.input === 'equip') {
      this.equipBtn.dom.style.display = 'block';
      this.descEquip.innerText = d.data; 

      if (d.data === null) {
        desctext.innerText = '장착된 장비 정보가 없습니다.';
      } else {
        // 장비정보가 있을 때-
      }
    } else {
      this.descEquip.innerText = d.name; 
      desctext.innerText = d.data.description; 
      this.equipBtn.dom.style.display = 'none';
    }
    this.descEquip.appendChild(desctext);
  }
}

