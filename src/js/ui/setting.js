import Panel from "./component/panel";
import Modal from "./component/modal";
import Button from "./component/button";
import MakeDom from "./component/makedom";
import RadioButton from "./component/radioButton";
import { sound } from "pixi.js";

export default class Setting extends Panel {
  constructor(pane, callback) {
    super();
    this.pane = pane;
    
    this.callback = callback;

    const modal = new Modal(this.pane, 380, 240);
    modal.dom.classList.add('setting');
    modal.addTitle('설정');
    modal.addCloseButton();
    this.dom = modal.dom;

    // Master, bgm, default
    this.contents = document.createElement('div');
    this.contents.className = 'contents';
    
    this.addOption('MASTER', 0);
    this.addOption('BGM', 1);
    this.addOption('EFFECT', 2);
    this.dom.appendChild(this.contents);
    // modal.closeBtn.addEventListener('click', this.onClose.bind(this));
  }

  addOption(type, index) {
    const optionsWrap = new MakeDom('section', 'group');
    const title = new MakeDom('h3', 'group_title');
    const options = new MakeDom('div', 'options');
    let result = 0;

    if (type === 'MASTER') {
      title.innerText = '전체음향';

      let option1 = new RadioButton('option1', type, 'ON');
      let option2 = new RadioButton('option2', type, 'OFF');
      options.appendChild(option1);
      options.appendChild(option2);

    } else {
      if ( type === 'BGM') {
        title.innerText = '배경음악';
        optionsWrap.classList.add('bgm');
      } else {
        title.innerText = '효과음';
        optionsWrap.classList.add('effect');
      }
      let option1 = new RadioButton('option1', type, 0);
      let option2 = new RadioButton('option2', type, 1);
      let option3 = new RadioButton('option3', type, 2);

      options.appendChild(option1);
      options.appendChild(option2);
      options.appendChild(option3);
    }
    
    let data = options.querySelectorAll('input');
    data.forEach(option => {
      option.addEventListener('click', this.onChanged.bind(this, option));
    });

    data[index].setAttribute('checked', 'checked');

    optionsWrap.appendChild(title);
    optionsWrap.appendChild(options);

    this.contents.appendChild(optionsWrap);
  }

  onChanged (option) {
    let value = 0;

    if(option.value === 'ON') {
      value = 1;
    } else if (option.value === 'OFF') {
      value = 0;
    } else {
      value = option.value*0.5;
    }
    
    this.callback(option.name, value); 
  }
}