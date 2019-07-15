import MakeDom from "./makedom";

export default class Avatar {
  constructor(input){ 
    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    
    this.profile = null;
    this.avatar = null;
    
    if (input === null) {
      avatar.classList.add('empty');
    } else {
      avatar.classList.add('isCrew');

      this.path = '/src/assets/sprite/';
      this.path = `${this.path}${input.data.name}/${input.data.name}_idle_sw.png`;
      
      const infoWrap = new MakeDom('div', 'infoWrap');
      const level = new MakeDom('p', 'level', `LV.${input.level}`);
      const name = new MakeDom('p', 'name', input.data.displayname);
      const statBox = new MakeDom('div', 'statBox');
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
      infoWrap.appendChild(statBox);
      statBox.appendChild(this.dps);
      infoWrap.appendChild(this.health);
      

      avatar.appendChild(imgWrap);
      avatar.appendChild(infoWrap);
    }
    this.dom = avatar;
  }
}