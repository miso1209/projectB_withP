import MakeDom from "./makedom";

export default class Avatar {
  constructor(input) {
    const avatar = document.createElement('div');
    avatar.classList.add('avatar');

    this.profile = null;
    this.avatar = input;

    // 사망한 캐릭터 표시
    this.status = 'idle';

    if (input === null) {
      avatar.classList.add('empty');
    } else {
      avatar.classList.add('isCrew');

      // 사망한 캐릭터 표시
      if (input.health === 0) {
        this.status = 'die';
        avatar.classList.add('die');
      } else {
        this.status = 'idle';
        avatar.classList.remove('die');
      }

      this.path = '/src/assets/sprite/';
      this.path = `${this.path}${input.data.name}/${input.data.name}_${this.status}_sw.png`;

      const infoWrap = new MakeDom('div', 'infoWrap');
      const level = new MakeDom('p', 'level', `LV.${input.level}`);
      const name = new MakeDom('p', 'name', input.data.displayname);
      const stats = new MakeDom('div', 'statBox');
      stats.classList.add('_dps');

      this.dps = new MakeDom('p', 'stat', input.totalPowerFigure);
      this.health = new MakeDom('p', 'health', `${input.health}`);

      const imgWrap = new MakeDom('p', 'imgWrap');
      const profileimg = new MakeDom('img', 'profileImg');
      profileimg.src = this.path;

      imgWrap.style.width = '48px';
      imgWrap.style.height = '72px';

      const stage = new MakeDom('p', 'stage');
      imgWrap.appendChild(profileimg);
      this.profile = imgWrap;

      // equipments
      avatar.appendChild(stage);
      infoWrap.appendChild(level);
      infoWrap.appendChild(name);
      infoWrap.appendChild(stats);
      stats.appendChild(this.dps);
      // infoWrap.appendChild(this.health);

      avatar.appendChild(imgWrap);
      avatar.appendChild(infoWrap);
    }
    this.dom = avatar;
  }

  update() {
    if (this.status === 'die') {
      this.dom.classList.add('die');
    } else {
      this.dom.classList.remove('die');
    }
    this.path = `${this.path}${this.avatar.data.name}/${this.avatar.data.name}_${status}_sw.png`;
    profileimg.src = this.path;
  }
}