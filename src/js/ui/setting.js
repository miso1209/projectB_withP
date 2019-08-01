import Panel from "./component/panel";
import Modal from "./component/modal";
import Button from "./component/button";
import MakeDom from "./component/makedom";
import RadioButton from "./component/radioButton";

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

    this.contents = document.createElement('div');
    this.contents.className = 'contents';

    this.addOption('Master', Sound.options['Master']);
    this.addOption('BGM', Math.round(Sound.options['BGM']*2));
    this.addOption('Default', Math.round(Sound.options['Default']*2));
    
    this.dom.appendChild(this.contents);
  }

  addOption(type, index) {
    console.log(index);
    
    const optionsWrap = new MakeDom('section', 'group');
    const title = new MakeDom('h3', 'group_title');
    const options = new MakeDom('div', 'options');
    
    if (type === 'Master') {
      title.innerText = '전체음향';

      let option1 = new RadioButton('option1', type, 'ON');
      let option2 = new RadioButton('option2', type, 'OFF');
      
      options.appendChild(option1);
      options.appendChild(option2);
    } else {
      if ( type === 'BGM') {
        title.innerText = '배경음악';
      } else {
        title.innerText = '효과음';
      }

      let option1 = new RadioButton('option1', type, 0);
      let option2 = new RadioButton('option2', type, 1);
      let option3 = new RadioButton('option3', type, 2);

      options.appendChild(option1);
      options.appendChild(option2);
      options.appendChild(option3);
    }
    
    this.onChanged(options.querySelectorAll('input')[index]);

    let data = options.querySelectorAll('input');
    data[index].setAttribute('checked', 'checked');

    data.forEach(radio => {
      radio.addEventListener('click', this.onChanged.bind(this, radio));
    });

    optionsWrap.appendChild(title);
    optionsWrap.appendChild(options);

    this.contents.appendChild(optionsWrap);
  }

  onChanged (option) {
    let value = 0;
    let sibilings = option.parentNode.parentNode.childNodes;
    sibilings.forEach(node => {
      node.classList.remove('checked');
    });
    option.parentNode.classList.add('checked');
    
    if(option.value === 'ON') {
      value = 0;
    } else if (option.value === 'OFF') {
      value = 1;
    } else {
      value = option.value*0.5;
    }

    this.callback(option.name, value); 
  }
}