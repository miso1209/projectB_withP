import Panel from "./component/panel";
import Modal from "./component/modal";
import ItemImage from "./component/itemimage";
import MakeDom from "./component/makedom";
import Button from "./component/button";

export default class CharacterDetail extends Panel {
  constructor(pane, input, result) {
    super();

    this.selected = input;
    this.statItem = null;
    this.isActive = null;
    this.result = result;

    // 모달
    const modal = new Modal(pane, 800, 460);
    pane.classList.add('screen');

    modal.addTitle('캐릭터 정보');
    modal.addCloseButton();
    modal.dom.classList.add('characterDetail');
    this.dom = modal.dom;

    // 모달 내부 컨텐츠 영역
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

    this.equipBtn = new Button('장비장착', 'buttonS');
    this.equipBtn.dom.style.display = 'none';
    this.equipBtn.moveToRight(10);
    this.equipBtn.moveToBottom(10);
    
    if (this.equipBtn.dom) {
      this.equipBtn.dom.addEventListener('click', ()=>{
        this.equipCallback();
      });
    }

    descBox.appendChild(this.equipBtn.dom);
    descBox.appendChild(this.descEquip);
    //.left

    this.statWrap = new MakeDom('ul', 'statWrap');
    const mainStats = new MakeDom('div', 'mainStat');

    let statMagic = new MakeDom('span', 'stat', `마법 : ${this.selected.magic}`);
    let statAttack = new MakeDom('span', 'stat', `공격력 : ${this.selected.attack}`);
    let statArmor = new MakeDom('span', 'stat', `방어력 : ${this.selected.armor}`);

    leftBox.appendChild(descBox);
    mainStats.appendChild(statMagic);
    mainStats.appendChild(statAttack);
    mainStats.appendChild(statArmor);
    rightBox.appendChild(mainStats);

    leftBox.appendChild(titleWrap);
    leftBox.appendChild(infoWrap);

    leftBox.appendChild(this.equipItems);
    leftBox.appendChild(this.skillItems);
    rightBox.appendChild(this.statWrap);

    contentsWrap.appendChild(leftBox);
    contentsWrap.appendChild(rightBox);
    
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
    
    for (let base in this.selected.data.base) {
      if ( base !== 'regist') {
        let baseStat = document.createElement('li');
        let plusStat = document.createElement('span');

        let text = base.charAt(0).toUpperCase() + base.slice(1);
        let baseStatText = 'base' + text;
        let plusStatText = 'plus' + text;
        
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
    console.log('updateEquip---');
    
    this.equipItems.innerHTML = '';
    
    // 아이템 데이터가 없어도 카테고리 정보는 필요하다..인벤 데이터 긁어오려면..하드코...ㄷ...
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
      liWrap.addEventListener('click', this.updateDesc.bind(this, 'gear'));
    });
  }


  updateSkill(){
    this.skillItems.innerHTML = '';

    let data = {input: 'skill', data: null};
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

      liWrap.addEventListener('click', this.updateDesc.bind(this, 'skill'));
    });
  }

  updateDesc(input) {
    // 초기화
    this.descEquip.innerHTML = '';
    
    const desctext = new MakeDom('p', 'desc-text');
    let d = this.statItem;

    if (input === 'gear') {
      this.equipBtn.dom.style.display = 'block';
      if (d.data === null) {
        desctext.innerText = '장착된 장비 정보가 없습니다.';
        this.equipBtn.dom.innerText = '장비장착';
      } else {
        this.descEquip.innerText = d.data.name; 
        desctext.innerText = d.data.description;
        this.equipBtn.dom.innerText = '장비해제';
      }
    } else {
      this.equipBtn.dom.style.display = 'none';
      this.descEquip.innerText = d.data.name; 
      desctext.innerText = d.data.description; 
    }

    this.descEquip.appendChild(desctext);
  }

  equipCallback(flag){
    this.result(this.statItem, flag);
  }
}


