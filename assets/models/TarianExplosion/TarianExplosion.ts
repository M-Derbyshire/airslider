import ASModel from '../ASModel/ASModel';
import IAnimation from '../Model/ModelAnimationsManager/IAnimation';
import Tarian from '../Tarian/Tarian';

/**
 * Explosion effect, to be used during Tarian's loss sequence
 */
export default class TarianExplosion extends ASModel {
    
    private _player:Tarian;
    private _maxHeight:number;
    private _maxWidth:number;
    private _resizeSpeedX:number;
    private _resizeSpeedY:number;
    private _animFrame:IAnimation;
    private _alarmSound:HTMLAudioElement;
    
    /**
     * Constructor
     * @param playerModel The model of the player
     */
    constructor(playerModel:Tarian) {
        super();
        
        this._player = playerModel;
        
        this._maxHeight = 750;
        this._maxWidth = 2000;
        this._resizeSpeedX = 1500;
        this._resizeSpeedY = 1500;
    }
    
    prepare():void
    {
        super.prepare();
        this.display = false;
        this.state = "std";
        this.active = true;
        this.z = 1;
        
        this._animFrame.width = 0;
        this._animFrame.height = 0;
    }
    
    load():void
    {
        super.load();
        
        this._alarmSound = this.kernel.loadAudio("/assets/models/TarianExplosion/sounds/alarm.mp3");
        
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
    
    act():void
    {
        if(this._player.lost)
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
    
    /**
     * Resizes the sprite, to create the exploding effect
     */
    private _resize():void
    {
        if(this._animFrame.width === 0)
        {
            this.kernel.soundEn.playSound(this._alarmSound);
        }
        
        this._animFrame.width += this.kernel.helpers.unit.xSpeed(this._resizeSpeedX);
        this._animFrame.height += this.kernel.helpers.unit.ySpeed(this._resizeSpeedY);
        
        if(this._animFrame.width > this._maxWidth || this._animFrame.height > this._maxHeight)
        {
            this._animFrame.width = 0;
            this._animFrame.height = 0;
        }
    }

    /**
     * Centers the x position on the player
     */
    private _centreOnPlayer():void
    {
        this.x = this._player.x + (this._player.width / 2) - (this.width / 2);
    }

    /**
     * Sets the correct y position
     */
    private _setYPosition():void
    {
        // Place the bottom of the explosion at the bottom of the player
        this.y = ((this._player.y + this._player.height) - this._animFrame.height) + 25;
    }

    /**
     * Sets the z position, based on the player's
     */
    private _setZPosition():void
    {
        this.z = this._player.z - 1;
    }
}