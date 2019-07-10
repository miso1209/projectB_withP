import MakeDom from './makedom';

export default class StatusBar{
  constructor(currentValue, maxValue) {

    this.progressHolder = document.createElement('div');
    this.progressHolder.classList.add('progressHolder');
    this.progressHolder.classList.add('status');

    this.progressBar = document.createElement('div');
    this.progressBar.classList.add('progressbar');

    this.maxValue = maxValue;
    this.progressHolder.appendChild(this.progressBar);

    this.rate = new MakeDom('span', 'progressRate', `${currentValue} / ${maxValue}`);
    this.progressHolder.appendChild(this.rate);

    this.dom = this.progressHolder;
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
    this.progressBar.classList.add(_type);
  }
}