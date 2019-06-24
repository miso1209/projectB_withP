import Panel from "./component/panel";
import Modal from "./component/modal";
import MakeDom from "./component/makedom";
import ItemImage from "./component/itemimage";
import Button from "./component/button";

export default class AcquireModal extends Panel {
  constructor(item, inputs, domheight, result) {
    super();

    const modal = new Modal(pane, 300, domheight);
    this.dom = modal.dom;
    this.dom.classList.add('acquireModal');

    this.inputs = inputs;
    this.title = null;
    this.dom.style.top = '50%';
    this.dom.style.marginTop = domHeight * -0.5 + 'px';

    const itemText = document.createElement('div');
    itemText.className = 'contents';
    itemText.style.top = 'auto';
    itemText.style.bottom = '70px';
    
    this.itemSprite = null;
    this.itemText = itemText;

    itemAcquire.dom.appendChild(itemText);
    itemAcquire.dom.appendChild(itemSprite);

    init();

  }
  init() {
    this.addTitle(this.title);
    modal.addCloseButton();
    modal.addConfirmButton('확인');
    modal.addCancelButton('취소');
    modal.moveToCenter(0);
  }
  showItemText() {
    this.itemText.innerText = item.name;
  }

  showItem() {
    const image = new ItemImage('items@2.png', item.data.image.x, item.data.image.y);
    this.itemSprite = image.dom;
    itemSprite.style.position = 'absolute';
    itemSprite.style.left = '0';
    itemSprite.style.right = '0';
    itemSprite.style.margin = '90px auto 0';
  }

  hide(){

  }

  addButton(args){
    if (args !== null) {

    }
  }
}