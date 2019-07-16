import MakeDom from './makedom';

export default class StatText {
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
      key: 'health',
      en: 'hp',
      ko: '체력'
    }, {
      key: 'exp',
      en: 'exp',
      ko: '경험치'
    }, {
      key: 'attack',
      en: 'atk',
      ko: '공격력'
    }, {
      key: 'deffence',
      en: 'def',
      ko: '방어력'
    }, {
      key: 'strength',
      en: 'str',
      ko: '힘'
    }, {
      key: 'agility',
      en: 'agi',
      ko: '민첩'
    }, {
      key: 'intellect',
      en: 'int',
      ko: '지력'
    }, {
      key: 'stamina',
      en: 'sta',
      ko: '내구력'
    }, {
      key: 'speed',
      en: 'spd',
      ko: '속도'
    }, {
      key: 'criticalPotential',
      en: 'cric',
      ko: '치명타 확률'
    }, {
      key: 'critical',
      en: 'crid',
      ko: '치명타 피해'
    }, {
      key: 'dps',
      en: 'dps',
      ko: '전투력'
    }
  ];

    this.update();
    return textWrap;
}

  update() {
    this.textData.forEach(base => {
      if (base.key === this.input) {
        this.text_ko.innerText = `${base.ko}`;
        this.text_en.innerText = `${base.en.toUpperCase()}`;
      }
    });
  }
}
