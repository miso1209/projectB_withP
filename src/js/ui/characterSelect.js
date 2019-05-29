import Panel from "./component/panel";
import Modal from "./component/modal";
import MakeDom from "./component/makedom";
import ItemImage from "./component/itemimage";
import Button from "./component/button";


export default class CharacterSelect extends Panel {
  constructor(pane, inputs, result) {
    super();

    // todo 현재 배틀용 캐릭터 데이터를 받아와서 작업. 이후 정제된 데이터로 수정한다.
    this.inputs = inputs;
    this.result = result;
    this.selected = null;
    
    const pickme = new Modal(pane, 800, 460, null);
    this.dom = pickme.dom;
    this.dom.classList.add('pickme');

    pickme.addTitle('캐릭터 선택창');
    pickme.addCloseButton();
    pane.classList.add('screen');

    this.prevButton = new Button('', 'paging');
    this.prevButton.dom.classList.add('prev');
    this.prevButton.dom.classList.add('disabled');
    this.prevButton.moveToLeft(-45);
    this.prevButton.dom.style.top = '50%';

    this.nextButton = new Button('', 'paging');
    this.nextButton.dom.classList.add('next');
    this.nextButton.dom.classList.add('disabled');
    this.nextButton.moveToRight(-45);
    this.nextButton.dom.style.top = '50%';
    
    const wrap = document.createElement('div');
    wrap.classList.add('contents');
    wrap.classList.add('flexWrap');
    wrap.style.top = '80px';
    this.dom.appendChild(wrap);

    // characterDetail 
    const characterDesc = new MakeDom('div', 'descWrap', null);
    characterDesc.classList.add('characterDesc');
    characterDesc.classList.add('flex-right');
    characterDesc.style.width = '240px';

    this.descClass = document.createElement('p');
    this.descName = document.createElement('p');
    this.portrait = document.createElement('img');


    // 현재 캐릭터 데이터에는 장비정보가 없어서 하드코딩.
    // 캐릭터 장비정보
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
    equipItems.style.paddingTop = '20px';
    
    equipItemsData.forEach(item => {
      let itemIcon = new ItemImage('items.png', item.x, item.y);
      itemIcon.className = 'stat-item';
  
      let itemName = document.createElement('span');
      itemName.innerText = item.item;
  
      itemIcon.dom.style.display = 'inline-block';
      equipItems.appendChild(itemIcon.dom);
    });

    this.stat_health = new MakeDom('p', 'stat', null);
    
    // 자세히 보기 버튼 콜백
    const moreButton = new Button('자세히보기', 'submit');
    moreButton.moveToCenter(10);
    moreButton.moveToBottom(10);
    moreButton.dom.addEventListener('click', (ok)=> {
      // todo 
      pane.parentNode.removeChild(pane);
      return this.result(this.selected);
    });

    characterDesc.appendChild(this.portrait);
    characterDesc.appendChild(this.descClass);
    characterDesc.appendChild(this.descName);
    characterDesc.appendChild(this.stat_health);
    characterDesc.appendChild(equipItems);
    characterDesc.appendChild(moreButton.dom);
    
    // characterList
    const characterListWrap = new MakeDom('div', 'characterListWrap', null);
    characterListWrap.classList.add('flex-left');
    characterListWrap.style.width = '430px';
    characterDesc.appendChild(characterListWrap);

    const characterList = new MakeDom('div', 'characterList', null);
    characterList.style.width = '410px';
    
    let selected = null;
    let index = 0;
    let n = 0;

    inputs.forEach(input => {
      let doll = new Doll(input);
      doll.dom.classList.add('doll');

      if (index === 0) {
        doll.dom.classList.add('active');
        selected = doll.dom;
        this.select(input);
      }
      
      if (n >= 4) {
        n = 0; // todo 타일용 index 따로 만들자.
      }

      let posX = -70 * n;

      ++index;
      ++n;

      doll.stage.style.backgroundPosition = `${posX}px 0`;

      doll.dom.addEventListener('click', function(){
        if(selected) {
          selected.classList.remove('active');
        }
        doll.dom.classList.add('active');
        selected = doll.dom;
      });

      doll.dom.addEventListener('click', this.select.bind(this, input));
      characterList.appendChild(doll.dom);
    });

    // paging
    characterList.appendChild(this.prevButton.dom);
    characterList.appendChild(this.nextButton.dom);
    characterListWrap.appendChild(characterList);

    wrap.appendChild(characterListWrap);
    wrap.appendChild(characterDesc);
    pane.appendChild(this.dom);
  }

  select(current) {
    console.log(current.data);

    this.selected = current.data;
    const path = '/src/assets/';

    this.descClass.innerText = this.selected.displayname;
    this.descName.innerText = this.selected.name;
    this.portrait.src = path + this.selected.portrait;
    this.stat_health.innerText = 'Health : ' + this.selected.base.health;
  }
}

class Doll {
  constructor(item){ //캐릭터데이터-input
    const doll = document.createElement('div');
    doll.classList.add('doll');

    this.path = '/src/assets/sprite/';
    this.path = `${this.path}${item.data.name}/${item.data.name}_idle_sw.png`;

    const name = new MakeDom('p', 'name', item.data.displayname);
    const imgWrap = new MakeDom('p', 'imgWrap', null);
    const profile = new MakeDom('img', 'profileImg', null);
    profile.src = this.path;

    imgWrap.style.width = '64px';
    imgWrap.style.height = '96px';

    this.stage = new MakeDom('p', 'tilebg', null);
    imgWrap.appendChild(profile);
    // equipments
    doll.appendChild(this.stage);
    doll.appendChild(name);
    doll.appendChild(imgWrap);

    this.dom = doll;
  }
}




