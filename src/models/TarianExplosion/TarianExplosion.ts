import Kernel from '../../../Kernel/Kernel';
import ASModel from '../ASModel/ASModel';
import IModelAnimationsManager, { IAnimation } from '../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';
import Tarian from '../Tarian/Tarian';
import UnitHelper from '../../../Kernel/utils/UnitHelper';
import { SoundStatus } from '../../../Kernel/engines/SoundEngine/ISoundEngine';

/**
 * Explosion effect, to be used during Tarian's loss sequence
 */
export default class TarianExplosion extends ASModel {
    
    private _player:Tarian; // The player model
    private _maxHeight:number; // The limit on how tall the explosion can get
    private _maxWidth:number; // The limit on how wide the explosion can get
    private _resizeSpeedX:number; // The speed that the width increases
    private _resizeSpeedY:number; // The speed that the height increases
    private _animFrame:IAnimation; // The single frame of the one animation the model uses
    private _alarmSoundKey:string; // The key for the alarm sound effect that the explosion plays
    
    /**
     * Constructor
     * @param modelAnimationsManager manages the animations for the model
     * @param playerModel The model of the player
     */
    constructor(modelAnimationsManager:IModelAnimationsManager, playerModel:Tarian) {
        super(modelAnimationsManager);
        
        this._player = playerModel;
        
        this._maxHeight = 750;
        this._maxWidth = 2000;
        this._resizeSpeedX = 1500;
        this._resizeSpeedY = 1500;
        
        this._alarmSoundKey = "/models/TarianExplosion/sounds/alarm.mp3";
    }
    
    load():void
    {
        super.load();
        
        const assetHandler = Kernel.getInstance().assetHandler;
        
        // Not adding this to assetsToUnload, as every level needs this
        const alarmSound = assetHandler.loadAudio(this._alarmSoundKey);
        this.sounds.push({
            key: this._alarmSoundKey,
            asset: alarmSound
        });
        
        const sheetPath = "/models/TarianExplosion/anim/TarianExplosion.png";
        this.spritesheet = assetHandler.loadImage(sheetPath);
    }
    
    registerAnimations():void
    {
        super.registerAnimations();
        
        // Keeping a reference to this, as we want to change the draw width/height dynamically
        this._animFrame = this.animationManager.createAnimation({
            spritesheet: this.spritesheet, 
            fps: 24,
            drawWidth: 0,
            drawHeight: 0,
            frameCoordinates: [
                { x: 0, y: 0, width: 1333, height: 753 }
            ]
        });
        
        this.animationManager.registerAnimations({
            standard: this._animFrame
        });
    }
    
    prepare():void
    {
        super.prepare();
        
        this.state = "standard";
        this.active = true;
        
        this._animFrame.width = 0;
        this._animFrame.height = 0;
    }
    
    act():void
    {
        if(this._player.lost)
        {   
            this._runSound();
            this._resize();
            this._centreOnPlayer();
            this._setYPosition();
            this._setZPosition();
        }
        else if (this._player.health <= 10)
        {
            this._forceLoadAlarm();
        }
        
        if(!this._player.active)
            this.active = false;
    }
    
    /**
     * Runs the sound effect (if it's the right time to do so)
     */
    private _runSound():void
    {
        if(this._animFrame.width === 0)
            Kernel.getInstance().soundEngine.playSound(this._alarmSoundKey);
    }
    
    /**
     * Resizes the sprite, to create the exploding effect
     */
    private _resize():void
    {
        this._animFrame.width += UnitHelper.speed(this._resizeSpeedX);
        this._animFrame.height += UnitHelper.speed(this._resizeSpeedY);
        
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
        const playerCenter = (this._player.width / 2);
        const explosionCenter = (this.width / 2);
        
        this.x = this._player.x + playerCenter - explosionCenter;
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
     * Sets the z position, based on the player's z position
     */
    private _setZPosition():void
    {
        this.z = this._player.z - 1;
    }
    
    /**
     * Force the loading of the sound effect, in preparation for the explosion
     */
    private _forceLoadAlarm():void
    {
        const soundEngine = Kernel.getInstance().soundEngine;
        
        if(soundEngine.getSoundStatus(this._alarmSoundKey) === SoundStatus.Stopped)
            soundEngine.forceSoundToLoad(this._alarmSoundKey);
    }
}