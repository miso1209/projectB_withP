import Panel from './component/panel';
import MakeDom from './component/makedom';
import Button from './component/button';


export default class QuestList extends Panel {
  constructor(inputs){
    super();

    this.inputs = inputs;

    const questWrap = new MakeDom('div', 'questWrap');
    const frag = document.createDocumentFragment();
    const title = new MakeDom('p', 'title', '퀘스트 목록');
    const button = new Button('더보기', 'textButton');

    this.contents = new MakeDom('ul', 'contents-list');

    frag.appendChild(title);
    frag.appendChild(this.contents);
    title.appendChild(button.dom);

    questWrap.appendChild(frag);
    this.dom = questWrap;

    this.update();
  }

  update(){
    this.contents.innerHTML = '';

    if (this.inputs) {
      this.inputs.forEach(quest => {
        let lidom = new MakeDom('li');
        let quest_name = new MakeDom('p', 'quest_name');
        let quest_desc = new MakeDom('p', 'quest_desc');
  
        lidom.appendChild(quest_name);
        lidom.appendChild(quest_desc);
  
        this.contents.appendChild(lidom);
      });
    }
  }
}