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
    
    this.input = input;

    console.log(this.input);
    
    const contentsWrap = document.createElement('div');
    contentsWrap.classList.add('contents');

     // 캐릭터 정보
     const profile = new MakeDom('img', 'profile', null);
     profile.src = 'src/assets/' + this.input.portrait;

    // 캐릭터 스탯 정보 - 임시..
    const contents = document.createElement('div');
    contents.classList.add('contents-box');
    contents.style.marginTop = '30px';

    const playerName = new MakeDom('p', 'playerName', this.input.displayname);
    contents.appendChild(playerName);

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
    equipItems.style.top = '100px';
  
    equipItemsData.forEach(item => {
      let itemIcon = new ItemImage('items.png', item.x, item.y);
      itemIcon.className = 'stat-item';
  
      let itemName = document.createElement('span');
      itemName.innerText = item.item;
  
      itemIcon.dom.style.display = 'inline-block';
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
    skillItems.style.top = '100px';
  
    skillItemData.forEach(item => {
      let itemIcon = new ItemImage('items.png', item.x, item.y);
  
      itemIcon.className = 'stat-item';
  
      let itemName = document.createElement('span');
      itemName.innerText = item.skill;
  
      itemIcon.dom.style.display = 'inline-block';
      // itemIcon.dom.append(itemName);
      skillItems.appendChild(itemIcon.dom);
    });
  

    contentsWrap.appendChild(profile);
    contentsWrap.appendChild(equipItems);
    contentsWrap.appendChild(skillItems);
    contentsWrap.appendChild(contents);

    statUI.dom.appendChild(contentsWrap);
  

    // 버튼
    const equip_btn = new Button('아이템 장착');
    equip_btn.moveToLeft(20);
    equip_btn.moveToBottom(20);
    equip_btn.dom.classList.add('_small');
    equip_btn.dom.style.margin = '0 auto';
  
  
    const skill_btn = new Button('스킬');
    skill_btn.moveToRight(20);
    skill_btn.moveToBottom(20);
    skill_btn.dom.classList.add('_small');
    skill_btn.dom.style.margin = '0 auto';
   
    this.dom = statUI.dom;
  
    statUI.dom.appendChild(equip_btn.dom);
    statUI.dom.appendChild(skill_btn.dom);
  }
}


// class Profile extends Panel {
//   constructor(player) {
//     super();
    
//     console.log(player);
//     return;


//     let profile = document.createElement('div');
//     profile.className = 'profile';

//     let profileImg = document.createElement('img');
//     let name = document.createElement('strong');
//     let level = document.createElement('span');

//     name.className = 'profile-name';
//     level.className = 'profile-level';

//     let lv_value = null;
//     level.innerText = 'LV.' + lv_value;

//     this.profile = profile;
//     this.name = name;
//     this.level = level;

//     profileImg.src = `/src/assets/${player.portrait}`
//     profile.style.position = 'absolute';

//     this.profile.append(profileImg);
//     this.profile.append(level);
//     this.profile.append(name);

//     this.dom = this.profile;
//   }
// }
