export default class ItemImage {
    constructor(texture, x, y) {
        const imageSprite = document.createElement('div');
        this.path = '';
        this.size = 32;
        this.orginal = (texture.toString());
        this.dom = imageSprite;

        if (this.orginal.includes('items')) {
            this.path = `url(/src/assets/items/${texture})`;
            this.type = 'img';
        } else {
            this.path = `url(/src/assets/ui/${texture})`;
            this.size = 16;
            this.type = 'icon';
        }

        if (this.orginal.includes('@2')) {
            this.size = this.size * 2;
        }

        imageSprite.classList.add(this.type);
        imageSprite.style.backgroundImage = this.path;
        imageSprite.style.width = `${this.size}px`;
        imageSprite.style.height = `${this.size}px`;
        
        if(this.type === 'icon') {
            this.updateIcon(x);
        } else {
            imageSprite.style.backgroundPositionX = -(x * this.size) + 'px';
        }
        imageSprite.style.backgroundPositionY = -(y * this.size) + 'px';

        this.positionX = 0;
        this.positionY = 0;
    }
  
    updateImage(x, y){
        this.dom.style.backgroundPositionX = -(x * this.size) + 'px';
        this.dom.style.backgroundPositionY = -(y * this.size) + 'px';
    }

    updateIcon(_rank) {
        const rankData = ["c","b","a","s","u"];

        for (let i = 0; i < rankData.length; i++) {
            let index = rankData[i].toUpperCase();
            
            if (_rank === index) {
                if( i > 2) {
                    this.dom.classList.add('shiny');
                }

                this.dom.style.backgroundPositionX = -(i * this.size) + 'px';
            }
        }
    }
}
