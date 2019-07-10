import Panel from "./component/panel";
import Modal from "./component/modal";
import MakeDom from "./component/makedom";
import ItemImage from "./component/itemimage";
import Button from "./component/button";
// import { stringify } from "querystring";
import Avatar from "./component/avatar";
import StatusBar from './component/statusbar';

export default class CharacterSelect extends Panel {
  constructor(pane, inputs, avatar, result) {
    super();

    this.pane = pane;
    this.pane.classList.add('screen');

    // 캐릭터 전체
    this.inputs = inputs;
    this.callback = result;

    // 선택한 캐릭터 정보
    this.selected = null;
    this.consumablesData = null;

    // 모달
    const modal = new Modal(pane, 800, 460, null);
    modal.addTitle('캐릭터 선택창');
    modal.addCloseButton();
    modal.dom.classList.add('characterSelect');

    this.dom = modal.dom;
    this.controlCharacter = avatar;

    // 페이징버튼
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

    // 모달 내부 컨텐츠 영역
    const wrap = new MakeDom('div', 'flexWrap')
    wrap.classList.add('contents');
    wrap.style.top = '70px';
    this.dom.appendChild(wrap);

    // 캐릭터 info - characterDesc
    const characterDesc = new MakeDom('div', 'characterDesc');
    characterDesc.classList.add('flex-right');

    const infoWrap = new MakeDom('div', 'infoWrap');

    this.portrait = document.createElement('img');
    this.portrait.style.display = 'block';
    this.portrait.style.margin = '30px auto 10px';

    this.changeAvatarBtn = new Button('', 'iconBtn');
    this.changeAvatarBtn.dom.classList.add('ico-avatar');
    this.changeAvatarBtn.dom.style.top = '60px';
    this.changeAvatarBtn.moveToLeft(40);
    
    this.changeAvatarBtn.dom.addEventListener('click', (ok) => {
      this.setMainAvatar();
    });

    this.recoveryBtn = new Button('', 'iconBtn');
    this.recoveryBtn.dom.classList.add('ico-life');
    this.recoveryBtn.dom.style.top = '60px';
    this.recoveryBtn.moveToRight(40);

    const titleWrap = new MakeDom('div', 'titleWrap');
    this.descClass = new MakeDom('span', 'stat_class');
    this.descName = new MakeDom('span', 'stat_name');
    this.level = new MakeDom('span', 'stat_level');
    this.level.style.paddingRight = '10px';

    // hp, exp 상태바
    const statWrap = new MakeDom('div', 'statWrap');
    this.hp = new StatusBar(0, 10);
    this.exp = new StatusBar(0, 10);
    this.exp.setBar('exp');

    statWrap.appendChild(this.hp.dom);
    statWrap.appendChild(this.exp.dom);

    // 포션 - 최대 4개
    this.invenItems = document.createElement('ul');
    this.invenItems.className = 'invenItems';

    // 자세히 보기 버튼 콜백
    const moreButton = new Button('자세히보기', 'submit');
    moreButton.moveToCenter(0);
    moreButton.moveToBottom(15);
    moreButton.dom.addEventListener('click', (ok) => {
      this.hideModal();
      return this.callback('characterDetail', this.selected);
    });

    titleWrap.appendChild(this.level);
    titleWrap.appendChild(this.descClass);

    infoWrap.appendChild(this.portrait);
    infoWrap.appendChild(this.recoveryBtn.dom);
    infoWrap.appendChild(this.changeAvatarBtn.dom);

    characterDesc.appendChild(titleWrap);
    characterDesc.appendChild(infoWrap);
    characterDesc.appendChild(statWrap);
    characterDesc.appendChild(this.invenItems);
    characterDesc.appendChild(moreButton.dom);

    // characterList
    const characterListWrap = new MakeDom('div', 'characterListWrap');
    characterListWrap.classList.add('flex-left');

    this.characterList = new MakeDom('div', 'characterList');
    this.characterList.style.width = '410px';

    // paging
    characterListWrap.appendChild(this.prevButton.dom);
    characterListWrap.appendChild(this.nextButton.dom);
    characterListWrap.appendChild(this.characterList);

    wrap.appendChild(characterListWrap);
    wrap.appendChild(characterDesc);

    pane.appendChild(this.dom);

    this.createCharacters();
  }

  createCharacters(){
    let selectedavatar = null;
    let index = 0;
    let n = 0;

    // 캐릭터 데이터가 6개 넘어갈 때 - 처리는 페이징 해야하는데 그러려면. .
    this.inputs.forEach(input => {
      let avatar = new Avatar(input);
      if (index === 0) {
        avatar.dom.classList.add('active');
        selectedavatar = avatar.dom;
        this.select(input);
      }

      if (n >= 4) {
        n = 0; // todo 타일용 index 따로 만들자.
      }

      let posX = -70 * n;

      ++index;
      ++n;

      avatar.stage.style.backgroundPosition = `${posX}px 0`;
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
    this.portrait.src = path + current.data.portrait;
    this.level.innerText = 'Lv.' + current.level;

    this.updateStatus(current);
  }

  updateHealth() {
    if (this.selected.health === 0) {
      this.recoveryBtn.dom.classList.remove('half');
      this.recoveryBtn.dom.classList.add('empty');
    } else if (this.selected.health < this.selected.maxHealth) {
      this.recoveryBtn.dom.classList.remove('empty');
      this.recoveryBtn.dom.classList.add('half');
    } else {
      this.recoveryBtn.dom.classList.remove('empty');
      this.recoveryBtn.dom.classList.remove('half');
      this.recoveryBtn.dom.disabled = 'disabled';
    }
  }

  updateStatus(current) {
    this.hp.update(current.health, current.maxHealth);
    this.exp.update(current.exp, current.maxexp);
    this.updateHealth();
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