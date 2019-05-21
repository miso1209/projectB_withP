import Panel from "./component/panel";

export default class ProgressUI extends Panel {
    constructor(container, interval, onComplete) {
        super();
        this.pane = container;
        this.pane.classList.add('loadingScene');
    
        // dom
        const holder = document.createElement('div');
        holder.classList.add('progressHolder');
        holder.id = 'progressHolder';
    
        const bar = document.createElement('div');
        bar.classList.add('progressbar');
        holder.appendChild(bar);
        this.progressBar = bar;
    
        const rate = document.createElement('p');
        rate.className = 'progressRate'
        bar.appendChild(rate);
    
        this.progress = 1;
        this.interval = interval;
    
        this.timer = null;
        this.rate = rate;
        this.isLoading = false;
        this.pane.appendChild(holder);
        this.dom = holder;
        
        this.onComplete = onComplete;
        this.update();
    }
  
    update() {
        this.timer = setInterval(() => {
    
            if (this.progress * this.interval === 100) {
    
                clearInterval(this.timer);
            
                this.onComplete('loading_complete');
                this.timer = null;
                this.isLoading = false;
            } else {
                ++this.progress;
                this.isLoading = true;
                this.progressBar.style.width = this.progress * this.interval + '%';
                this.rate.innerText = this.progress * this.interval + '%';
            }
        }, 100);
    }
  
    hide() {
        this.pane.classList.remove('loadingScene');
        this.pane.removeChild(this.dom);
    }
}