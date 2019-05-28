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
    const pickme = new Modal(pane, 400, 460, result);
    this.dom = pickme.dom;
    this.dom.classList.add('pickme');

    pickme.addTitle('캐릭터 선택창');
    pickme.addCloseButton();
    pane.classList.add('screen');

    this.prevButton = new Button('', 'paging');
    this.prevButton.dom.classList.add('prev');
    this.prevButton.moveToLeft(10);
    this.prevButton.dom.style.top = '50%';

    this.nextButton = new Button('', 'paging');
    this.nextButton.dom.classList.add('next');
    this.nextButton.moveToRight(10);
    this.nextButton.dom.style.top = '50%';
    
    const wrap = document.createElement('div');
    wrap.className = 'contents';
    wrap.style.top = '50px';
    this.dom.appendChild(wrap);

    // characterDetail 
    const characterDesc = new MakeDom('div', 'descWrap', null);
    characterDesc.classList.add('characterDesc');
    this.descName = document.createElement('p');
    
    // characterList
    const characterList = new MakeDom('div', 'characterList', null);

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
        n = 0;
        // todo 타일용 index 따로 만들자.
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

    // button
    characterDesc.appendChild(this.descName);
    wrap.appendChild(characterDesc);
    wrap.appendChild(characterList);

    pickme.dom.appendChild(this.prevButton.dom);
    pickme.dom.appendChild(this.nextButton.dom);

    pane.appendChild(this.dom);
  }

  select(current) {
    this.descName.innerText = current.data.displayname;
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

    imgWrap.style.width = '32px';
    imgWrap.style.height = '48px';

    this.stage = new MakeDom('p', 'tilebg', null);
    imgWrap.appendChild(profile);
    // equipments
    doll.appendChild(this.stage);
    doll.appendChild(name);
    doll.appendChild(imgWrap);

    this.dom = doll;
  }
}



