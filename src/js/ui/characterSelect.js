import Panel from "./component/panel";
import Modal from "./component/modal";
import MakeDom from "./component/makedom";
import ItemImage from "./component/itemimage";
import Button from "./component/button";
// import { stringify } from "querystring";
import Doll from "./component/doll";

export default class CharacterSelect extends Panel {
  constructor(pane, inputs, result) {
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
    const wrap = document.createElement('div');
    wrap.classList.add('contents');
    wrap.classList.add('flexWrap');
    wrap.style.top = '70px';
    this.dom.appendChild(wrap);

    // 캐릭터 설명 - characterDesc
    const characterDesc = new MakeDom('div', 'descWrap', null);
    characterDesc.classList.add('characterDesc');
    characterDesc.classList.add('flex-right');

    const infoWrap = new MakeDom('div', 'infoWrap', null);

    this.portrait = document.createElement('img');
    this.portrait.style.display = 'block';
    this.portrait.style.margin = '30px auto 10px';

    this.playerClass = new MakeDom('div', 'ico-class');
    // this.characterClass.moveToRight(40);

    // 현재 hp 상태 아이콘 -> TODO : 클래스아이콘으로 변경하자.
    this.recoveryBtn = new Button('', 'iconBtn');
    this.recoveryBtn.dom.classList.add('ico-life');
    this.recoveryBtn.dom.style.top = '60px';
    this.recoveryBtn.moveToRight(40);

    const titleWrap = new MakeDom('div', 'titleWrap', null);
    this.descClass = new MakeDom('span', 'stat_class', null);
    this.descName = new MakeDom('span', 'stat_name', null);
    this.level = new MakeDom('span', 'stat_level', null);
    this.level.style.paddingRight = '10px';

    // hp, exp 상태바
    const statWrap = new MakeDom('div', 'statWrap', null);
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
      return this.callback(this.selected);
    });

    titleWrap.appendChild(this.level);
    titleWrap.appendChild(this.descClass);
    infoWrap.appendChild(this.portrait);
    infoWrap.appendChild(this.recoveryBtn.dom);
    // infoWrap.appendChild(this.playerClass);

    characterDesc.appendChild(titleWrap);
    characterDesc.appendChild(infoWrap);
    characterDesc.appendChild(statWrap);
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
      // doll.dom.classList.add('doll');

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
      doll.dom.addEventListener('click', function () {
        if (selectedDoll) {
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
    // this.playerClass.innerText = current.data.class;

    this.updateStatus(current);
    // this.updateHealth();
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

  hideModal() {
    this.pane.parentNode.removeChild(this.pane);
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

  setBar(_type) {
    this.progressBar.classList.add(_type);
  }
}