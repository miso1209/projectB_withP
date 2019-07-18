import Panel from "./component/panel";
import Modal from "./component/modal";
import Button from "./component/button";

export default class Setting extends Panel {
    constructor(pane, inputs, callback) {
      super();
        this.pane = pane;
        this.callback = callback;
        this.settingData = inputs;

        const modal = new Modal(this.pane, 380, 240);
        modal.dom.id = 'Setting';
        modal.addTitle('설정');

        modal.addCloseButton();
    
        this.contents = document.createElement('div');
        this.contents.className = 'contents';
        modal.dom.appendChild(this.contents);
        this.dom = modal.dom;
        
        modal.closeBtn.addEventListener('click', this.onClose.bind(this));
    }

    onClose() {
      this.callback('ok');
    }
}