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

    // IE 스크롤바 이슈 대응
    const scrollView = document.createElement('div');
    scrollView.classList.add('scrollView');
    
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

    questWrap.appendChild(frag);
    this.dom = questWrap;

    this.update();
  }

  update(){
    this.list.innerHTML = '';
    let index = 0;
    
    if (this.inputs.length > 0) {
      this.inputs.forEach(quest => {
        ++index;
        
        let listCell = new MakeDom('li');
        let quest_name = new MakeDom('p', 'quest_name', quest.title);
        let quest_mission = new MakeDom('p', 'quest_mission');
        let quest_complete = new MakeDom('p', 'completeText', '퀘스트완료');
        
        quest_mission.innerHTML = `${quest.objectives[0].text} ${quest.objectives[0].count} / ${quest.objectives[0].maxCount}`
        
        if (this.inputs.length === index) {
          listCell.classList.add('new');
        }

        if (quest.success) {
          listCell.classList.add('success');
        }

        listCell.appendChild(quest_name);
        listCell.appendChild(quest_mission);
        listCell.appendChild(quest_complete);

        listCell.addEventListener('click', ()=>{
          listCell.classList.remove('new');
        });

        listCell.addEventListener('click', this.select.bind(this, quest));
        this.list.appendChild(listCell);
      });
    } else {
      const comment = new MakeDom('li', 'comment');
      comment.innerHTML = '새로운 퀘스트가<br>없습니다';
      this.list.appendChild(comment);
    }
  }
}