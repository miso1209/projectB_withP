import Panel from './component/panel';
import Modal from './component/modal';
import MakeDom from './component/makedom';
import Button from './component/button';
import ItemImage from './component/itemimage';

export default class QuestModal extends Panel {
    constructor(pane, inputs, qid, result){
      super();

      pane.classList.add('screen');
      this.pane = pane;
      this.qid = qid;
      this.inputs = inputs; // 현재 진행중인 퀘스트 데이터
      this.result = result;
    
      const modal = new Modal(pane, 800, 460, null);
      modal.addTitle('퀘스트');
      modal.addCloseButton();
      this.dom = modal.dom;
      this.dom.classList.add('quest');
      
      // 전체 컨텐츠 wrapper
      const wrapper = new MakeDom('div', 'flexWrap');
      wrapper.classList.add('contents');
      wrapper.style.top = '70px';
      
      const questList = new MakeDom('div', 'flex-left');
      questList.classList.add('questList');

      this.questInfo = new MakeDom('div', 'flex-right');
      this.questInfo.classList.add('questInfo');
      
      // IE 스크롤바 이슈 대응
      const scrollView = document.createElement('div');
      scrollView.classList.add('scrollView');
      
      const scrollBlind = document.createElement('div');
      scrollBlind.className = 'scrollBlind';
      scrollBlind.style.height = '330px';

      this.list = document.createElement('ul');
      this.list.classList.add('list-box');
      this.list.classList.add('scrollbox');

      scrollView.appendChild(scrollBlind);
      scrollBlind.appendChild(this.list);
      questList.appendChild(scrollView);
      wrapper.appendChild(this.questInfo);
      wrapper.appendChild(questList);

      this.dom.appendChild(wrapper);
      this.updateList();
    }

    updateList() {
      let selectedCell = null;
      let index = -1;
      
      this.inputs.forEach(quest => {
        ++index;

        const cell = new MakeDom('li', 'cell');
        const title = new MakeDom('p', 'quest_title', quest.title);
        const status = new MakeDom('p', 'quest_status');

        if (quest.type === 'Acceptable') {
          status.innerText = '미진행 퀘스트';
        } else {
          status.innerText = (quest.success)?'퀘스트완료':'퀘스트진행중';
        }

        if (quest.success) {
          cell.classList.add('success');
        } else {
          cell.classList.remove('success');
        }

        cell.appendChild(title);
        cell.appendChild(status);

        if (index === 0) {
          cell.classList.add('active');
          selectedCell = cell;
          this.listcallback(quest);
        }

        if (this.qid !== undefined) {
          if(`${index+1}` === this.qid.questid) {
            selectedCell.classList.remove('active');

            cell.classList.add('active');
            selectedCell = cell;
            this.listcallback(quest);
          }
        } 
        
        cell.addEventListener('click', ()=> {
          if (selectedCell) {
              selectedCell.classList.remove('active');
          }
          cell.classList.add('active');
          selectedCell = cell;
        });

        cell.addEventListener('click', this.listcallback.bind(this, quest));
        this.list.appendChild(cell);
      });
    }

    listcallback(quest) {
      this.questInfo.innerHTML = '';
      
      const frag = document.createDocumentFragment();
      const title = new MakeDom('p', 'quest_title', quest.title);
      const description = new MakeDom('p', 'quest_desc');
      const mission = new MakeDom('p', 'quest_mission');
      const status = new MakeDom('p', 'quest_status');

      description.innerHTML = quest.description;
      mission.innerHTML = `${quest.objectives[0].text} ${quest.objectives[0].count} / ${quest.objectives[0].maxCount}`
      
      const button = new Button('완료 보상');
      button.dom.classList.add('rewardBtn');
      button.moveToCenter(0);
      button.moveToBottom(20);

      if (quest.type === 'Acceptable') {
        button.dom.style.display = 'block';
        button.dom.innerText = '퀘스트 받기';
      } else {
        if (quest.success) {
          button.dom.style.display = 'block';
        } else {
          button.dom.style.display = 'none';
        }
        status.innerHTML = (quest.success)?'퀘스트 완료':'퀘스트 진행중';
      }

      button.dom.addEventListener('click', ()=>{
        this.pane.parentNode.removeChild(this.pane);
        return this.result(quest)
      });

      // 퀘스트 보상
      const rewards = new MakeDom('div', 'quest_reward');
      let data = [];

      for(const r in quest.rewards) {
        const rewardText = quest.rewards[r].text;

        if (rewardText !== undefined) { // TODO : cutscene 제외.. 예외처리는 나중에 개발이랑 싱크 맞추기..
          let itemData = quest.rewards[r].itemData;
          const item = new MakeDom('div', 'item');
          const count = new MakeDom('span', 'count');

          if(itemData.item !== null) { 
            const img = new ItemImage(itemData.item.image.texture, itemData.item.image.x, itemData.item.image.y);
            item.appendChild(img.dom);
            count.innerText = ` x ${itemData.count}`;
          } else { // gold???? 
            const img = new MakeDom('img', 'img');
            img.src = './src/assets/ui/gold.png';
            item.appendChild(img);
            count.innerText = ` x ${rewardText}`;;
          }
          item.appendChild(count);
          data.push(rewardText);
          rewards.appendChild(item);
        }
      };
      
      frag.appendChild(title);
      frag.appendChild(description);
      frag.appendChild(mission);
      frag.appendChild(status);
      frag.appendChild(rewards);
      frag.appendChild(button.dom);

      this.questInfo.appendChild(frag);
    }
  }