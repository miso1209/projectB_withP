import Panel from "./component/panel";
import Modal from "./component/modal";
import MakeDom from "./component/makedom";
import ItemImage from "./component/itemimage";
import Button from "./component/button";

export default class ItemAcquire extends Panel {
  constructor(pane, text, items, result) {
    super();

    let domheight = 240;
    
    if (text) {
      domheight += 40;
    }
    const modal = new Modal(pane, 300, domheight);
    
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
    const okButton = new Button('확인', 'submit');
    const cancelButton = new Button('취소');

    if (this.text !== null) {
      okButton.moveToLeft(20);
      cancelButton.moveToRight(20);
      cancelButton.moveToBottom(20);
      this.dom.appendChild(cancelButton.dom);
      cancelButton.dom.addEventListener('click', this.onCancel.bind(this));
    } else {
      okButton.moveToCenter(0);
    }

    okButton.moveToBottom(20);
    this.dom.appendChild(okButton.dom);
    okButton.dom.addEventListener('click', this.onSubmit.bind(this));
  }

  update() {
    if (this.items.length > 0) {

      this.options.classList.add('items');
      
      this.items.forEach((item) => {
        let wrap = new MakeDom('section', 'option');
        let option = new ItemImage(item.data.image.texture, item.data.image.x, item.data.image.y);
        let count = new MakeDom('span', '', `x${item.owned}`);
        wrap.appendChild(option.dom);
        wrap.appendChild(count);
        this.options.appendChild(wrap);
      });
    } else {
      let option = new ItemImage(this.items.data.texture, this.items.data.image.x, this.items.data.image.y);
      let count = new MakeDom('span', '', `x${this.items.owned}`);
      this.options.appendChild(option.dom);
      this.options.appendChild(count);
    }
  }

  onSubmit() {
    this.onclose();
    this.callback('ok');
  }

  onCancel() {
      this.onclose();
      this.callback('cancel');
  }

  onclose() {
    this.dom.parentNode.removeChild(this.dom);
  }
}