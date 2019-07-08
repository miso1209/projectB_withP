import Panel from './component/panel';
import MakeDom from './component/makedom';
import Button from './component/button';


export default class QuestList extends Panel {
  constructor(){
    super();

    const questWrap = new MakeDom('div', 'questWrap');
    // const wrap = new MakeDom('div');
    // const title = new MakeDom('p', '__title', '퀘스트 목록');
    // const button = new Button('더보기', 'buttonMore');

    // wrap.appendChild(button.dom);
    // wrap.appendChild(title);

    // this.dom.appendChild(wrap);
    this.dom = questWrap;
  }

  update(){

  }
}