import MakeDom from './makedom';

export default class MultiLang {
  constructor(_input, _align) {
    this.input = _input;

    const textWrap = new MakeDom('div', 'statText');
    textWrap.classList.add(_align);

    this.text_ko = new MakeDom('strong', 'text_ko');
    this.text_en = new MakeDom('span', 'text_en');
    if(_align === undefined) {
      this.text_en.style.display = 'block';
    }
    textWrap.appendChild(this.text_ko);
    textWrap.appendChild(this.text_en);

    this.textData = [{
      en: 'hp',
      ko: '체력'
    }, {
      en: 'exp',
      ko: '경험치'
    }, {
      en: 'atk',
      ko: '공격력'
    }, {
      en: 'def',
      ko: '방어력'
    }, {
      en: 'str',
      ko: '힘'
    }, {
      en: 'agi',
      ko: '민첩'
    }, {
      en: 'int',
      ko: '지력'
    }, {
      en: 'sta',
      ko: '내구력'
    }, {
      en: 'spd',
      ko: '속도'
    }, {
      en: 'cric',
      ko: '치명타 확률'
    }, {
      en: 'crid',
      ko: '치명타 피해'
    }];

    this.update();
    return textWrap;
}

  update() {
    this.textData.forEach(base => {
      if (base.en === this.input) {
        this.text_ko.innerText = `${base.ko}`;
        this.text_en.innerText = `${base.en.toUpperCase()}`;
      }
    });
  }
}
