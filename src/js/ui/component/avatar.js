import MakeDom from "./makedom";
import items from "../../items";

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
      const name = new MakeDom('p', 'name', input.data.displayname);
      const stat = new MakeDom('p', 'stat', input.totalPowerFigure);
      const stat2 = new MakeDom('p', 'avatar_health', `${input.health}`);
      
      const imgWrap = new MakeDom('p', 'imgWrap');
      const profileimg = new MakeDom('img', 'profileImg');

      profileimg.src = this.path;
      imgWrap.style.width = '64px';
      imgWrap.style.height = '96px';

      this.stage = new MakeDom('p', 'tilebg');
      imgWrap.appendChild(profileimg);

      this.profile = imgWrap;

      // equipments
      avatar.appendChild(this.stage);
      infoWrap.appendChild(name);
      infoWrap.appendChild(stat);
      infoWrap.appendChild(stat2);

      avatar.appendChild(imgWrap);
      avatar.appendChild(infoWrap);
    }
    this.dom = avatar;
  }
}