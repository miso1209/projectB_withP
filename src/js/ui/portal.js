import Panel from './component/panel';
import Modal from './component/modal';
import MakeDom from './component/makedom';
import Button from './component/button';


export default class Portal extends Panel {
  constructor(pane, inputs, time, result){
    super();

    this.data = inputs;
    this.callback = result;
    this.time = time;

    const modal = new Modal(pane, 360, 360);
    modal.addTitle('포털');
    modal.dom.classList.add('portal');

    this.dom = modal.dom;
    this.pane = pane;

    const contents = new MakeDom('div', 'contents');
    modal.dom.appendChild(contents);

    const comment = new MakeDom('p', 'comment', '이동할 층을 고르세요.');
    contents.appendChild(comment);
    
    // this.timerText = new MakeDom('p', 'timer');
    // contents.appendChild(this.timerText);

    const buttonWrap = document.createElement('div');
    buttonWrap.className = 'buttonWrap';

    const okButton = new Button('리스트 갱신', 'submit');
    const cancelButton = new Button('취소');

    buttonWrap.appendChild(cancelButton.dom);
    buttonWrap.appendChild(okButton.dom);
    
    cancelButton.dom.addEventListener('click', this.onCancel.bind(this));
    okButton.dom.addEventListener('click', this.onSubmit.bind(this));
    contents.appendChild(buttonWrap)

    // 항상 이동가능한 선택지는 5개로 랜덤하게 보여줌. 
    this.list = document.createElement('ul');
    this.list.classList.add('portal_list');

    contents.appendChild(this.list);

    this.showSelectableList(this.data);

    // if(this.time) {
    //   this.updateTime();
    // }
  }


  // updateTime(){
  //   let cnt = 60;
  //   this.timer = setInterval(() =>  {
  //       let limit = Math.floor(this.time/1000);
  //       this.timeConvert(limit);
  //       if (--cnt < 0) {
  //         cnt = 0;
  //         this.onClose();
  //       }
  //       this.time-=(cnt*60);
        
  //   }, 1000);
  // }

  // clearTimer(){
  //   clearInterval(this.timer);
  // }

  // timeConvert(num) {
  //   let minutes = (num/60);
  //   let rminutes = Math.floor(minutes);
  //   let seconds = (minutes - rminutes) * 60;
  //   let rseconds = Math.floor(seconds);

  //   this.timerText.innerHTML = `다음 리스트 갱신까지 남은 시간은${rminutes}분 ${rseconds}초 입니다.`;
  //   console.log(rminutes + 'min / ' + rseconds + 'sec' )
  // }

  showSelectableList(data, time){
    console.log(time);
    
    this.list.innerHTML = '';
    for (const fid in data) {
      let liwrap = new MakeDom('li', 'li');
      const linkBtn = new Button(`${data[fid]}`, 'nav');
      liwrap.appendChild(linkBtn.dom);
      linkBtn.dom.addEventListener('click', this.onSelect.bind(this, fid));

      this.list.appendChild(liwrap);
    }
  }

  onSelect(floor){
    if(this.callback) {
      this.callback(floor);
      this.onClose();
    }
  }

  onCancel(){
    if(this.callback){
      this.callback('cancel');
      this.onClose();
    }
  }

  onSubmit(){
    if(this.callback) {
      this.callback('ok');
    }    
  }

  onClose(){
    clearInterval(this.timer);
    this.pane.parentNode.removeChild(this.pane);
  }
}