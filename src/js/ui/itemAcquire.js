import Panel from "./component/panel";
import Modal from "./component/modal";
import MakeDom from "./component/makedom";
import ItemImage from "./component/itemimage";
import Button from "./component/button";

export default class ItemAcquire extends Panel {
  constructor(pane, text, items, result) {
    super();
    pane.classList.add('screen');

    let domheight = 240;
    if (items.length > 3) {
      domheight += 80;
    }

    const modal = new Modal(pane, 360, domheight);
    this.callback = result;

    // 레시피, 아이템인 경우
    this.items = items;
    this.text = text;

    this.dom = modal.dom;
    this.dom.classList.add('acquireModal');
    
    modal.addTitle('아이템 획득');
    modal.moveToCenter(0);

    this.dom.style.top = '50%';
    this.dom.style.marginTop = domheight * -0.5 + 'px';

    const contents = new MakeDom('div', 'contents');
    modal.dom.appendChild(contents);

    this.descText = new MakeDom('div', 'desc');

    if (text) {
      contents.appendChild(this.descText);
      this.descText.innerText = text;
    }

    this.options = new MakeDom('div', 'contents-option');
    contents.appendChild(this.options);

    this.update();
    this.initButton();
  }

  initButton(){
    const buttonWrap = new MakeDom('div', 'buttonWrap');

    const okButton = new Button('확인', 'submit');
    const cancelButton = new Button('취소');

    if (this.text !== null) {
        okButton.moveToLeft(20);
        cancelButton.moveToRight(20);
        cancelButton.moveToBottom(20);
        buttonWrap.appendChild(cancelButton.dom);
        cancelButton.dom.addEventListener('click', this.onCancel.bind(this));
      } else {
        okButton.moveToCenter(0);
      }
  
      okButton.moveToBottom(20);
      buttonWrap.appendChild(okButton.dom);
      okButton.dom.addEventListener('click', this.onSubmit.bind(this));
      this.dom.appendChild(buttonWrap);
    
  }

  update() {
    if (this.items.length > 0) {
      this.options.classList.add('items');
      this.items.forEach((item) => {
        let wrap = new MakeDom('section', 'option');
        let option = new ItemImage(item.data.image.texture, item.data.image.x, item.data.image.y);
        let count = new MakeDom('span', '', `x${item.count}`);
        let name = new MakeDom('p', 'name', item.name);
        wrap.appendChild(option.dom);
        wrap.appendChild(count);
        wrap.appendChild(name);
        this.options.appendChild(wrap);
      });
    } else {
      // 조합으로 얻어진 아이템인 경우를 체크해야함.. 음음
      let item = this.items;
      let option = new ItemImage(item.data.image.texture, item.data.image.x, item.data.image.y);
      let count = new MakeDom('span', '', `x${item.count}`);
      let name = new MakeDom('p', 'name', item.name);
      // let rank = new MakeDom('p', 'rank', item.rank);
      let iconRank = new ItemImage('icon_rank.png', item.rank, 0);
      iconRank.dom.classList.add('rank');

      this.options.appendChild(option.dom);
      this.options.appendChild(iconRank.dom);

      this.options.appendChild(count);
      this.options.appendChild(name);
    }
  }

  onSubmit() {
    this.onclose();
    if(this.callback) {
      this.callback('ok');
    }
  }

  onCancel() {
      this.onclose();
      if(this.callback) {
        this.callback('cancel');
      }
  }

  onclose() {
    this.dom.parentNode.removeChild(this.dom);
  }
}