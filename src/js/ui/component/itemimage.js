export default class ItemImage {
    constructor(texture, x, y) {
        const imageSprite = document.createElement('div');
        this.path = '';
        this.size = 32;
        this.orginal = (texture.toString());

        if (this.orginal.includes('items')) {
            this.path = `url(/src/assets/items/${texture})`;
            if (this.orginal.includes('@2')) {
                this.size = this.size * 2;
            }
        } else if (this.orginal.includes('character')) {
            this.path = `url(/src/assets/ui/${texture})`;
            this.size = 96;
        }
    
        imageSprite.classList.add('img');
        // imageSprite.style.backgroundImage = `url(/src/assets/items/${texture})`;
        imageSprite.style.backgroundImage = this.path;
        imageSprite.style.width = `${this.size}px`;
        imageSprite.style.height = `${this.size}px`;
        
        imageSprite.style.backgroundPositionX = -(x * this.size) + 'px';
        imageSprite.style.backgroundPositionY = -(y * this.size) + 'px';
        
        this.positionX = 0;
        this.positionY = 0;
    
        this.dom = imageSprite;
    }
  
    updateImage(x, y){
        this.dom.style.backgroundPositionX = -(x * this.size) + 'px';
        this.dom.style.backgroundPositionY = -(y * this.size) + 'px';
    }
}
