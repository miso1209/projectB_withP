import MakeDom from './makedom';
import StatText from './statText';


export default class StatusBar{
  constructor(currentValue, maxValue) {
    const wrap = new MakeDom('div', 'progressWrap');
    
    this.progressHolder = document.createElement('div');
    this.progressHolder.classList.add('progressHolder');
    this.progressHolder.classList.add('status');
    this.barName = new MakeDom('p', 'progressName');
    this.name = null;
    // wrap.appendChild(this.barName);
    
    
    this.progressBar = document.createElement('div');
    this.progressBar.classList.add('progressbar');

    this.maxValue = maxValue;
    this.progressHolder.appendChild(this.progressBar);

    this.rate = new MakeDom('span', 'progressRate', `${currentValue} / ${maxValue}`);
    this.progressHolder.appendChild(this.rate);
    wrap.appendChild(this.progressHolder);

    this.dom = wrap;
    this.update(currentValue, maxValue);
  }

  update(currentValue, maxValue) {
    this.maxValue = maxValue;

    let rate = Math.floor(currentValue * 100 / this.maxValue);
    rate = rate > 99 ? 100 : rate;

    this.progressBar.style.width = `${rate}%`;
    this.rate.innerText = `${currentValue} / ${maxValue}`;
  }

  setBar(_type) {
    this.dom.appendChild(this.barName);
    this.progressBar.classList.add(_type);
    const text = new StatText(_type);
    this.barName.appendChild(text);
  }
}