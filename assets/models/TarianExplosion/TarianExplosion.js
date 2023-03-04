import ASModel from '/assets/models/ASModel/ASModel';

export default class TarianExplosion extends ASModel {
    
    constructor(playerModel) {
        super(ASModel);
        
        this._player = playerModel;
        
        this.active = true;
        
        this._maxHeight = 750;
        this._maxWidth = 2000;
        this._resizeSpeedX = 1500;
        this._resizeSpeedY = 1500;
    }
    
    prepare()
    {
        super.prepare();
        this.display = false;
        this._state = "std";
        this.z = 1;
    }
    
    load()
    {
        super.load();
        
        this.animationManager.registerAnimations({
            std: this.animationManager.createAnimation({
                sheetPath: "/assets/models/TarianExplosion/anim/TarianExplosion.png", 
                fps: 24,
                drawWidth: 0,
                drawHeight: 0,
                frameCoordinates: [
                    { x: 0, y: 0, width: 1333, height: 753 }
                ]
            })
        });
        
        // Keeping a reference to this, as we want to change the width/height dynamically
        this._animFrame = this.animationManager.animations.std;
    }
    
    act()
    {
        if(this._player.lost || true)
        {
            if(!this.display && this._player.active)
                this.display = true;
            
            this._resize();
            this._centreOnPlayer();
            this._setYPosition();
            this._setZPosition();
        } 
        
        if(!this._player.active)
        {
            this.active = false;
        }
    }
    
    _resize()
    {
        this._animFrame.width += this.kernel.helpers.unit.xSpeed(this._resizeSpeedX);
        this._animFrame.height += this.kernel.helpers.unit.ySpeed(this._resizeSpeedY);
        
        if(this._animFrame.width > this._maxWidth || this._animFrame.height > this._maxHeight)
        {
            this._animFrame.width = 0;
            this._animFrame.height = 0;
        }
    }
    
    _centreOnPlayer()
    {
        this.x = this._player.x + (this._player.width / 2) - (this.width / 2);
    }
    
    _setYPosition()
    {
        // Place the bottom of the explosion at the bottom of the player
        this.y = ((this._player.y + this._player.height) - this._animFrame.height) + 25;
    }
    
    _setZPosition()
    {
        this.z = this._player.z - 1;
    }
}