import Panel from "./component/panel";
import Modal from "./component/modal";
import ItemImage from "./component/itemimage";
import Button from "./component/button";
import MakeDom from "./component/makedom";

export default class CharacterDetail extends Panel {
  constructor(pane, input) {
    super();

    const statUI = new Modal(pane, 360, 460);
    pane.classList.add('screen');
    
    statUI.addTitle('캐릭터 정보');
    statUI.addCloseButton();
    statUI.className = 'statUI';
    
    this.input = input;
    console.log(this.input);

     // 캐릭터 정보
     let playerId = 1;
     const profile = new MakeDom('div', 'profile')


    // 캐릭터 스탯 정보 - 임시..
    let statData = [];
    const contents = document.createElement('div');
    contents.classList.add('contents');
    contents.classList.add('contents-box');
    // contents.style.top = profile.dom.offsetTop + 130 + 'px';
    contents.style.bottom = '100px';
    contents.style.top = 'auto';

    const playerName = new MakeDom('p', 'playerName', this.input.displayname);
    contents.appendChild(playerName);

    statData.push("HP : 33");
    statData.push("MP : 3");
    statData.push("STRENGTH : 10");
    statData.push("DEFFENSE : 300");
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
    skillItems.style.bottom = contents.offsetTop + contents.offsetHeight + 20 + 'px';
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
   
    this.dom = statUI.dom;
  
    statUI.dom.appendChild(contents);
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
