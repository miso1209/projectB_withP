import Panel from "./component/panel";
import Modal from "./component/modal";
import Button from "./component/button";

export default class SystemModal extends Panel {
    constructor(pane, width, height, text, cancelable, callback) {
      super();
        this.pane = pane;
        this.pane.classList.add('screen');
    
        const confirmModal = new Modal(this.pane, width, height);
        confirmModal.dom.id = 'SYSTEM';
    
        this.contents = document.createElement('p',);
        this.contents.className = 'contents';
        this.contents.innerText = text;
        confirmModal.dom.appendChild(this.contents);
    
        this.callback = callback;
        this.cancelable = cancelable;

        const okButton = new Button('확인', 'submit');
        const cancelButton = new Button('취소');
    
        confirmModal.dom.appendChild(okButton.dom);

        if(this.cancelable) {
            okButton.moveToLeft(20);
            okButton.moveToBottom(20);

            cancelButton.moveToRight(20);
            cancelButton.moveToBottom(20);

            confirmModal.dom.appendChild(cancelButton.dom);
            cancelButton.dom.addEventListener('click', this.onCancel.bind(this));
        } else {
            okButton.moveToCenter(0);
            okButton.moveToBottom(20);
        }
    
        okButton.dom.addEventListener('click', this.onSubmit.bind(this));
        this.dom = confirmModal.dom;
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
        this.dom.parentNode.parentNode.removeChild(this.dom.parentNode);
    }
}