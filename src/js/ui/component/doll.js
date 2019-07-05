import MakeDom from "./makedom";
import items from "../../items";

export default class Doll {
  constructor(input){ 
    const doll = document.createElement('div');
    doll.classList.add('doll');
    
    this.profile = null;
    this.avatar = null;

    if (input === null) {
      doll.classList.add('empty');
    } else {
      doll.classList.add('isCrew');

      this.path = '/src/assets/sprite/';
      this.path = `${this.path}${input.data.name}/${input.data.name}_idle_sw.png`;
      
      const infoWrap = new MakeDom('div', 'infoWrap');
      const name = new MakeDom('p', 'name', input.data.displayname);
      const stat = new MakeDom('p', 'stat', input.totalPowerFigure);
      
      console.log(input);

      const stat2 = new MakeDom('p', 'stat', `${input.health}`);
      stat2.style.color = 'red';
      
      const imgWrap = new MakeDom('p', 'imgWrap');
      const profileimg = new MakeDom('img', 'profileImg');

      profileimg.src = this.path;
      imgWrap.style.width = '64px';
      imgWrap.style.height = '96px';

      this.stage = new MakeDom('p', 'tilebg');
      imgWrap.appendChild(profileimg);

      this.profile = imgWrap;

      // equipments
      doll.appendChild(this.stage);
      infoWrap.appendChild(name);
      infoWrap.appendChild(stat);
      infoWrap.appendChild(stat2);

      doll.appendChild(imgWrap);
      doll.appendChild(infoWrap);
    }
    this.dom = doll;
  }
}