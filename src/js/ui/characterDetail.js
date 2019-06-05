import Panel from "./component/panel";
import Modal from "./component/modal";
import ItemImage from "./component/itemimage";
import Button from "./component/button";
import MakeDom from "./component/makedom";

export default class CharacterDetail extends Panel {
  constructor(pane, input) {
    super();

    const statUI = new Modal(pane, 800, 460);
    pane.classList.add('screen');

    statUI.addTitle('캐릭터 정보');
    statUI.addCloseButton();
    statUI.className = 'statUI';
    statUI.dom.classList.add('characterDetail');

    this.selected = input;

    console.log(this.selected);
    
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

    leftBox.style.position = 'relative';
    leftBox.style.width = '50%';
    rightBox.style.width = '50%';

    const titleWrap = new MakeDom('div', 'titleWrap', null);
    this.descClass = new MakeDom('span', 'stat_class', null);
    this.descName = new MakeDom('span', 'stat_name', null);
    this.level = new MakeDom('span', 'stat_level', null);
    this.level.style.paddingRight = '10px';

    const infoWrap = new MakeDom('div', 'infoWrap', null);

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

    // 캐릭터 스탯 정보 - 임시..
    const statWrap = new MakeDom('ul', 'statWrap');
    
    const mainStats = new MakeDom('div', 'mainStat');
    let statMagic = new MakeDom('span', 'stat', `마법 : ${this.selected.magicPotential}`);
    let statAttack = new MakeDom('span', 'stat', `공격력 : ${this.selected.plusAttack}`);
    let statArmor = new MakeDom('span', 'stat', `방어력 : ${this.selected.plusArmor}`);

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

        console.log(baseStatText, plusStatText);

        baseStat.innerText = `${base} : ${this.selected[baseStatText]}`;
        plusStat.innerText = `( + ${this.selected[plusStatText]} )`;
        plusStat.style.paddingLeft = '10px';
        plusStat.style.color = '#ffd800';
        baseStat.appendChild(plusStat);
        statWrap.appendChild(baseStat);
      }
    }

    // const skillItems = document.createElement('div');
    // skillItems.className = 'skillItems';
    // skillItems.style.position = 'absolute';
    // skillItems.style.right = '30px';
    // skillItems.style.top = '0';
  
    // skillItemData.forEach(item => {
    //   let itemIcon = new ItemImage('items.png', item.x, item.y);
    //   itemIcon.dom.classList.add('iconBtn');
    //   skillItems.appendChild(itemIcon.dom);
    // });

    leftBox.appendChild(titleWrap);
    leftBox.appendChild(infoWrap);
    leftBox.appendChild(this.equipItems);
    // leftBox.appendChild(this.skillItems);
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
    this.updateEquip();
  }


  updateEquip(){
    // 테스트용 데이터
    this.equipItems.innerHTML = '';

    let equipItemsData = [];
    equipItemsData.push(this.selected.equipments.armor);
    equipItemsData.push(this.selected.equipments.weapon);
    equipItemsData.push(this.selected.equipments.accessory);

    equipItemsData.forEach(item => {
      if (item !== null) {
        // let item = new Item(itemID);
        let liWrap = new MakeDom('li', null, null);
        let itemIcon = new ItemImage(item.data.image.texture, item.data.image.x, item.data.image.y);
        itemIcon.dom.style.display = 'inline-block';

        // let itemCategory = new MakeDom('span', 'itemCategory', item.category.toUpperCase());
        // liWrap.appendChild(itemCategory);
        liWrap.appendChild(itemIcon.dom);
        this.equipItems.appendChild(liWrap);
      } 
    });
  }
}

