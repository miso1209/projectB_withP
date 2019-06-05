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

    this.input = input.data;

    console.log(this.input);
    
    const contentsWrap = document.createElement('div');
    contentsWrap.classList.add('contents');
    contentsWrap.classList.add('flexWrap');

    const gearWrap = new MakeDom('div', 'gearWrap', null);
    const statWrap = new MakeDom('div', 'statWrap', null);

    gearWrap.classList.add('flex-left');
    statWrap.classList.add('flex-right');
    statWrap.classList.add('contents-box');

    gearWrap.style.position = 'relative';
    gearWrap.style.width = '45%';
    statWrap.style.width = '55%';


    const playerName = new MakeDom('p', 'playerName', this.input.displayname);
    gearWrap.appendChild(playerName);


    // 캐릭터 정보
    const profile = new MakeDom('img', 'profile', null);
    profile.src = 'src/assets/' + this.input.portrait;


    // 캐릭터 스탯 정보 - 임시..
    const contents = document.createElement('div');
    contents.style.marginTop = '30px';


    for(let baseStat in this.input.base) {
      let stat = document.createElement('p');
      stat.innerText = `${baseStat} : ${this.input.base[baseStat]}`;
      contents.appendChild(stat);
    }
  
    // 현재 캐릭터 장비정보
    const equipItemsData = [{
      x: 4,
      y: 9,
      item: 'Weapon'
    }, {
      x: 6,
      y: 12,
      item: 'Armor'
    }, {
      x: 9,
      y: 3,
      item: 'Ring'
    }];
    
    const equipItems = document.createElement('div');
    equipItems.className = 'equipItems';
    equipItems.style.position = 'absolute';
    equipItems.style.left = '30px';
    equipItems.style.top = '0';
  
    equipItemsData.forEach(item => {
      let itemIcon = new ItemImage('items.png', item.x, item.y);
      itemIcon.dom.classList.add('iconBtn');

      // todo : 이름부분 이미지 내에 붙이면 줄바꿈되버림.. 외부로 붙일 수 잇게 인자값을 추가하자.
      // let itemName = document.createElement('span');
      // itemName.innerText = item.item;
      // itemIcon.dom.appendChild(itemName);
      equipItems.appendChild(itemIcon.dom);
    });
  
    // 현재 캐릭터 스킬정보
    const skillItemData = [{
      x: 1,
      y: 6,
      skill: 'Attack'
    }, {
      x: 4,
      y: 6,
      skill: 'Avoid'
    }];
    
    const skillItems = document.createElement('div');
    skillItems.className = 'skillItems';
    skillItems.style.position = 'absolute';
    skillItems.style.right = '30px';
    skillItems.style.top = '0';
  
    skillItemData.forEach(item => {
      let itemIcon = new ItemImage('items.png', item.x, item.y);
      itemIcon.dom.classList.add('iconBtn');
      skillItems.appendChild(itemIcon.dom);
    });
  
    gearWrap.appendChild(profile);
    gearWrap.appendChild(equipItems);
    gearWrap.appendChild(skillItems);
    statWrap.appendChild(contents);

    contentsWrap.appendChild(gearWrap);
    contentsWrap.appendChild(statWrap);

    statUI.dom.appendChild(contentsWrap);

    this.dom = statUI.dom;
  }
}

