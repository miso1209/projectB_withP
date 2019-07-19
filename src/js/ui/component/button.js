import Panel from "./panel";

export default class Button extends Panel {
    constructor(value, type) {
        super();
        
        const button = document.createElement('button');
        button.innerText = value;
        this.dom = button;

        button.classList.add('button');

        if (type !== undefined) {
            button.classList.remove('button');
            button.classList.add(`${type}`);
        }
        
        // ui에 button 클릭 사운드 이펙트 추가        
        button.addEventListener('click', ()=>{
            // 모든 버튼에 달리니까 조금 곤란하다.
            Sound.playSound('tab_change_2.wav', { singleInstance: true });
        });
    }

    setNewItem() {
        this.dom.classList.add('new');
    }
}

  