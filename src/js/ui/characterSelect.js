import Panel from "./component/panel";
import Modal from "./component/modal";
import MakeDom from "./component/makedom";
import ItemImage from "./component/itemimage";
import Button from "./component/button";
import { stringify } from "querystring";
// import StatusBar from './progressui';

export default class CharacterSelect extends Panel {
  constructor(pane, inputs, result) {
    super();

    // todo 현재 배틀용 캐릭터 데이터를 받아와서 작업. 이후 정제된 데이터로 수정한다.
    this.inputs = inputs;
    this.result = result;
    this.selected = null;
    
    // console.log(inputs);

    const pickme = new Modal(pane, 800, 460, null);
    this.dom = pickme.dom;
    this.dom.classList.add('characterSelect');

    pickme.addTitle('캐릭터 선택창');
    pickme.addCloseButton();
    pane.classList.add('screen');

    this.prevButton = new Button('', 'paging');
    this.prevButton.dom.classList.add('prev');
    this.prevButton.dom.classList.add('disabled');
    this.prevButton.moveToLeft(-35);
    this.prevButton.dom.style.top = '50%';

    this.nextButton = new Button('', 'paging');
    this.nextButton.dom.classList.add('next');
    this.nextButton.dom.classList.add('disabled');
    this.nextButton.moveToRight(-35);
    this.nextButton.dom.style.top = '50%';
    
    const wrap = document.createElement('div');
    wrap.classList.add('contents');
    wrap.classList.add('flexWrap');
    wrap.style.top = '70px';

    this.dom.appendChild(wrap);

    // characterDetail 
    const characterDesc = new MakeDom('div', 'descWrap', null);
    characterDesc.classList.add('characterDesc');
    characterDesc.classList.add('flex-right');

    const infoWrap = new MakeDom('div', 'infoWrap', null);

    this.dpsStat = new MakeDom('p', 'info-dps', null);

    this.portrait = document.createElement('img');
    this.portrait.style.display = 'block';
    this.portrait.style.margin = '30px auto 10px';

    this.recoveryBtn = new Button('','iconBtn');
    this.recoveryBtn.dom.classList.add('ico-life');
    this.recoveryBtn.dom.style.top = '60px';
    this.recoveryBtn.moveToRight(40);

    // this.recoveryBtn.dom.addEventListener('click', (ok)=> {
    //   return this.result(this.selected.id);
    // });

    const titleWrap = new MakeDom('div', 'titleWrap', null);
    
    this.descClass = new MakeDom('span', 'stat_class', null);
    this.descName = new MakeDom('span', 'stat_name', null);
    this.level = new MakeDom('span', 'stat_level', null);
    this.level.style.paddingRight = '10px';
    
    // status 바
    const statWrap = new MakeDom('div', 'statWrap', null);
    
    this.hp = new StatusBar(0, 10);
    this.exp = new StatusBar(0, 10);
    this.exp.setBar('exp');

    statWrap.appendChild(this.hp.dom);
    statWrap.appendChild(this.exp.dom);

    // 포션 - 4개 
    this.invenItems = document.createElement('ul');
    this.invenItems.className = 'invenItems';

    // 장비 
    // -- 장비가 없는 경우 좀 이상함 - 캐릭터 부상인 경우 포션을 바로 사용할 수 있게 하자.
    this.equipItems = document.createElement('ul');
    this.equipItems.className = 'equipItems';

    // 자세히 보기 버튼 콜백
    const moreButton = new Button('자세히보기', 'submit');
    moreButton.moveToCenter(0);
    moreButton.moveToBottom(15);
    moreButton.dom.addEventListener('click', (ok)=> {
      // pane.parentNode.removeChild(pane);
      return this.result(this.selected);
    });

    titleWrap.appendChild(this.level);
    titleWrap.appendChild(this.descClass);
    infoWrap.appendChild(this.portrait);
    infoWrap.appendChild(this.recoveryBtn.dom);
    // infoWrap.appendChild(this.dpsStat);

    characterDesc.appendChild(titleWrap);
    characterDesc.appendChild(infoWrap);
    characterDesc.appendChild(statWrap);

    // characterDesc.appendChild(this.equipItems);
    characterDesc.appendChild(this.invenItems);
    characterDesc.appendChild(moreButton.dom);
    
    // characterList
    const characterListWrap = new MakeDom('div', 'characterListWrap', null);
    characterListWrap.classList.add('flex-left');

    const characterList = new MakeDom('div', 'characterList', null);
    characterList.style.width = '410px';
    
    let selectedDoll = null;
    let index = 0;
    let n = 0;

    // 캐릭터 데이터가 6개 넘어갈 때 - 처리는 페이징 해야하는데 그러려면. .
    inputs.forEach(input => {
      let doll = new Doll(input);
      doll.dom.classList.add('doll');

      if (index === 0) {
        doll.dom.classList.add('active');
        selectedDoll = doll.dom;
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
        if(selectedDoll) {
          selectedDoll.classList.remove('active');
        }
        doll.dom.classList.add('active');
        selectedDoll = doll.dom;
      });

      doll.dom.addEventListener('click', this.select.bind(this, input));
      characterList.appendChild(doll.dom);
    });

    // paging
    characterListWrap.appendChild(this.prevButton.dom);
    characterListWrap.appendChild(this.nextButton.dom);
    characterListWrap.appendChild(characterList);

    wrap.appendChild(characterListWrap);
    wrap.appendChild(characterDesc);
    pane.appendChild(this.dom);
  }

  select(current) {
    this.selected = current;
    const path = '/src/assets/';

    this.descClass.innerText = current.data.displayname;
    this.descName.innerText = current.name;
    this.portrait.src = path + current.data.portrait;
    this.level.innerText = 'Lv.' + current.level;

    this.updateHealth();
    this.updateStatus(current);
    // this.updateEquip();
  }

  updateHealth() {
    if (this.selected.health === 0) {
      console.log('캐릭터 사망--부활물약?');
      this.recoveryBtn.dom.classList.remove('half');
      this.recoveryBtn.dom.classList.add('empty');
    } else if (this.selected.health < this.selected.maxHealth) {
      console.log('체력포션 쓸래?');
      this.recoveryBtn.dom.classList.remove('empty');
      this.recoveryBtn.dom.classList.add('half');
    } else {
      this.recoveryBtn.dom.classList.remove('empty');
      this.recoveryBtn.dom.classList.remove('half');
      this.recoveryBtn.dom.disabled = 'disabled';
    }
  }

  updateStatus(current){
    this.dpsStat.innerText = current.level;
    this.hp.update(current.health, current.maxHealth);
    this.exp.update(current.exp, current.maxexp);
  }

  updateInvenItems(invenItemsData, result) {
    // 테스트용 데이터
    this.invenItems.innerHTML = '';
    let csItems = [null,null,null,null];
    this.callback = result;

    console.log('updateInvenItems');

    invenItemsData.forEach(item => {
      let liWrap = new MakeDom('li', null, null);
      this.invenItems.appendChild(liWrap);
      
      if (item !== null) {
        let itemIcon = new ItemImage(item.data.image.texture, item.data.image.x, item.data.image.y);
        itemIcon.dom.style.display = 'inline-block';

        let itemCount = new MakeDom('span', 'itemCount', `x${item.owned}`);
        itemCount.style.color = '#ffd800';

        liWrap.appendChild(itemIcon.dom);
        liWrap.appendChild(itemCount);
        
        if(this.callback !== null) {
          liWrap.addEventListener('click', this.callback.bind(this, item));
        }
      }else {
        liWrap.classList.add('empty');
      }
    });
  }

  updateInven(invenItemsData){
    this.invenItems.innerHTML = '';
    
    invenItemsData.forEach(item => {
      let liWrap = new MakeDom('li', null, null);
      this.invenItems.appendChild(liWrap);
      
      if (item !== null) {
        let itemIcon = new ItemImage(item.data.image.texture, item.data.image.x, item.data.image.y);
        itemIcon.dom.style.display = 'inline-block';

        let itemCount = new MakeDom('span', 'itemCount', `x${item.owned}`);
        itemCount.style.color = '#ffd800';

        liWrap.appendChild(itemIcon.dom);
        liWrap.appendChild(itemCount);
        
        if(this.callback !== null) {
          liWrap.addEventListener('click', this.callback.bind(this, item));
        }
      }else {
        liWrap.classList.add('empty');
      }
    });
  }

  updateEquip(){
    this.equipItems.innerHTML = '';
    let equipItemsData = [];
    equipItemsData.push(this.selected.equipments.armor);
    equipItemsData.push(this.selected.equipments.weapon);
    equipItemsData.push(this.selected.equipments.accessory);

    equipItemsData.forEach(item => {
      let liWrap = new MakeDom('li', null, null);
      this.equipItems.appendChild(liWrap);

      if (item !== null) {
        let itemIcon = new ItemImage(item.data.image.texture, item.data.image.x, item.data.image.y);
        itemIcon.dom.style.display = 'inline-block';

        let itemCategory = new MakeDom('span', 'itemCategory', item.category.toUpperCase());
        liWrap.appendChild(itemCategory);
        liWrap.appendChild(itemIcon.dom);
      }else {
        liWrap.classList.add('empty');
      }
    });
  }
}


export class Doll {
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

class StatusBar {
  constructor(currentValue, maxValue) {
      this.progressHolder = document.createElement('div');
      this.progressHolder.classList.add('progressHolder');
      this.progressHolder.classList.add('status');

      this.progressBar = document.createElement('div');
      this.progressBar.classList.add('progressbar');

      this.maxValue = maxValue;
      this.progressHolder.appendChild(this.progressBar);

      this.rate = new MakeDom('span', 'progressRate', `${currentValue} / ${maxValue}`);
      this.progressHolder.appendChild(this.rate);

      this.dom = this.progressHolder;
      this.update(currentValue, maxValue);
  }

  update(currentValue, maxValue) {
    this.maxValue = maxValue;
    
    let rate = Math.floor(currentValue * 100 / this.maxValue);
    rate = rate > 99 ? 100 : rate;

    this.progressBar.style.width = `${rate}%`;
    this.rate.innerText = `${currentValue} / ${maxValue}`;
  }

  setBar(_type){
    this.progressBar.classList.add(_type);
  }
}