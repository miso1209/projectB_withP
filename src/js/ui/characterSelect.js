import Panel from "./component/panel";
import Modal from "./component/modal";
import MakeDom from "./component/makedom";
import ItemImage from "./component/itemimage";
import Button from "./component/button";
import Avatar from "./component/avatar";
import StatusBar from './component/statusbar';

export default class CharacterSelect extends Panel {
  constructor(pane, inputs, avatar, result) {
    super();

    this.pane = pane;
    this.inputs = inputs;
    this.callback = result;

    // 선택한 캐릭터 정보
    this.selected = null;
    this.consumablesData = null;

    // 모달
    const modal = new Modal(pane, 800, 440, null);
    modal.addTitle('캐릭터');
    modal.addCloseButton();
    modal.dom.classList.add('character');

    this.dom = modal.dom;
    this.controlCharacter = avatar;

    // 모달 내부 컨텐츠 영역
    const wrap = new MakeDom('div', 'flexWrap')
    wrap.classList.add('contents');
    this.dom.appendChild(wrap);

    
    // characterList
    const characterListWrap = new MakeDom('div', 'list-wrap');
    characterListWrap.classList.add('flex-left');
    this.characterList = new MakeDom('div', 'characterList');

    characterListWrap.appendChild(this.characterList);

    // 캐릭터 info - characterDesc
    const characterDesc = new MakeDom('div', 'list-detail');
    characterDesc.classList.add('flex-right');

    const infoWrap = new MakeDom('div', 'infoWrap');
    const portraitWrap = new MakeDom('div', 'portraitWrap'); 
    this.portrait = document.createElement('img');
    this.changeAvatarBtn = new Button('아바타 설정', 'checkbox');

    this.changeAvatarBtn.dom.addEventListener('click', (ok) => {
      this.changeAvatarBtn.dom.classList.toggle('active');
      this.setMainAvatar();
    });

    const titleWrap = new MakeDom('div', 'titleWrap');
    this.descClass = new MakeDom('span', 'stat_class');
    this.descName = new MakeDom('span', 'stat_name');
    this.level = new MakeDom('span', 'stat_level');
    this.level.style.paddingRight = '10px';

    // hp, exp 상태바
    const statWrap = new MakeDom('div', 'baseStats');
    this.hp = new StatusBar(0, 10);
    this.hp.setBar('health');
    
    this.exp = new StatusBar(0, 10);
    this.exp.setBar('exp');
    
    statWrap.appendChild(this.hp.dom);
    statWrap.appendChild(this.exp.dom);

    // 포션 - 최대 4개
    this.invenItems = document.createElement('ul');
    this.invenItems.className = 'invenItems';

    // 자세히 보기 버튼
    const buttonwrap = new MakeDom('div', 'buttonWrap');
    const moreButton = new Button('자세히보기', 'submit');
    moreButton.dom.classList.add('wide');
    moreButton.dom.addEventListener('click', (ok) => {
      this.hideModal();
      return this.callback('characterDetail', this.selected);
    });

    titleWrap.appendChild(this.level);
    titleWrap.appendChild(this.descClass);

    infoWrap.appendChild(portraitWrap);
    portraitWrap.appendChild(this.portrait);

    infoWrap.appendChild(this.changeAvatarBtn.dom);

    characterDesc.appendChild(titleWrap);
    characterDesc.appendChild(infoWrap);
    characterDesc.appendChild(statWrap);
    characterDesc.appendChild(this.invenItems);

    characterDesc.appendChild(buttonwrap);
    buttonwrap.appendChild(moreButton.dom);
    wrap.appendChild(characterListWrap);
    wrap.appendChild(characterDesc);

    pane.appendChild(this.dom);

    this.createCharacters();
  }

  createCharacters(){
    let selectedavatar = null;
    let index = 0;

    this.inputs.forEach(input => {
      let avatar = new Avatar(input);
      avatar.health.style.display = 'none';

      if (index === 0) {
        avatar.dom.classList.add('active');
        selectedavatar = avatar.dom;
        this.select(input);
      }

      ++index;

      avatar.dom.addEventListener('click', function () {
        if (selectedavatar) {
          selectedavatar.classList.remove('active');
        }
        avatar.dom.classList.add('active');
        selectedavatar = avatar.dom;
      });

      avatar.dom.addEventListener('click', this.select.bind(this, input));
      this.characterList.appendChild(avatar.dom);
    });
  }

  select(current) {
    this.selected = current;
    const path = '/src/assets/';

    this.descClass.innerText = current.data.displayname;
    this.descName.innerText = current.name;
    this.portrait.src = `${path}sprite/${current.name}/${current.name}_idle_sw.png`;
    this.level.innerText = 'Lv.' + current.level;
    this.updateStatus(current);
  }

  updateStatus(current) {
    this.hp.update(current.health, current.maxHealth);
    this.exp.update(current.exp, current.maxexp);
    
    this.portrait.classList.remove('death');
    
    if(current.health === 0) {
      this.portrait.classList.add('death');
    } 
    
    this.checkAvatar();
  }

  checkAvatar() {
    if (this.selected.id === `${this.controlCharacter}`) {
      this.changeAvatarBtn.dom.classList.add('active');
    } else {
      this.changeAvatarBtn.dom.classList.remove('active');
    }
  }

  createConsumablesItem(result) {
    this.invenItems.innerHTML = '';

    if (this.consumablesData.length === 0) {
      for (let i = 0; i < 4; i++) {
        let liWrap = new MakeDom('li');
        let itemIcon = new MakeDom('p', 'img');
        liWrap.classList.add('empty');
        liWrap.style.disabled = 'disabled';
        liWrap.appendChild(itemIcon);
        this.invenItems.appendChild(liWrap);
      }
    } else {
      this.consumablesData.forEach(item => {
        let liWrap = new MakeDom('li');
        let itemIcon = new ItemImage(item.data.image.texture, item.data.image.x, item.data.image.y);
        let itemCount = new MakeDom('span', 'itemCount', `x${item.owned}`);
        itemCount.style.color = '#ffd800';

        liWrap.appendChild(itemIcon.dom);
        liWrap.appendChild(itemCount);

        if (result) {
          liWrap.addEventListener('click', result.bind(this, item));
        }
        this.invenItems.appendChild(liWrap);
      });
    }
  }

  setMainAvatar() {
    this.controlCharacter = this.selected.id;
    this.callback('setMainAvatar', this.controlCharacter);
    this.checkAvatar();
  }

  hideModal() {
    this.pane.parentNode.removeChild(this.pane);
  }
}