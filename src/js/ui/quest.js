import Panel from './component/panel';
import MakeDom from './component/makedom';
import Button from './component/button';

export default class QuestList extends Panel {
  constructor(inputs, callback){
    super();

    this.inputs = inputs;
    this.select = callback;

    const questWrap = new MakeDom('div', 'questWrap');
    const frag = document.createDocumentFragment();
    const title = new MakeDom('p', 'title', '퀘스트 목록');
    const button = new Button('더보기', 'textButton');

    button.dom.addEventListener('click', () => {
      return this.select('showQuestModal');
    });

    // IE 스크롤바 이슈 대응
    const scrollView = document.createElement('div');
    scrollView.classList.add('scrollView');
    scrollView.style.width = '150px';
    
    const scrollBlind = document.createElement('div');
    scrollBlind.className = 'scrollBlind';
    scrollBlind.style.height = '135px';

    this.list = document.createElement('ul');
    this.list.classList.add('list-box');
    this.list.classList.add('scrollbox');

    scrollView.appendChild(scrollBlind);
    scrollBlind.appendChild(this.list);

    frag.appendChild(title);
    frag.appendChild(scrollView);
    title.appendChild(button.dom);

    questWrap.appendChild(frag);
    this.dom = questWrap;
    this.update();
  }

  update(){
    this.list.innerHTML = '';

    if (this.inputs) {
      this.inputs.forEach(quest => {
        let listCell = new MakeDom('li');
        let quest_name = new MakeDom('p', 'quest_name', quest.origin.title);
        let quest_desc = new MakeDom('p', 'quest_desc');
        quest_desc.innerHTML = quest.origin.description;

        listCell.appendChild(quest_name);
        listCell.appendChild(quest_desc);

        this.list.appendChild(listCell);
        listCell.addEventListener('click', this.select.bind(this, quest));
      });
    }
  }
}