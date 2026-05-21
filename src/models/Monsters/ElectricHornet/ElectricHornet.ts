import IAssetHandler from '../../../../Kernel/AssetHandler/IAssetHandler';
import Kernel from '../../../../Kernel/Kernel';
import { IHitBox } from '../../../../Kernel/entities/Model/IModel';
import IModelAnimationsManager from '../../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';
import ASLevel from '../../../levels/ASLevel/ASLevel';
import Monster from '../../Monster/Monster';

/**
 * The Electric Hornet monster
 */
export default class ElectricHornet extends Monster {
    
    private _buzzSoundKey:string; // The key for the buzzing sound effect
    
    private _initialDropWait!:number; // The amount of milliseconds before the first attack (after entering)
    private _firstDropTimeMS!:number; // The time (in milliseconds) when the attacking should begin
    
    private _startXSpeed!:number; // The initial x speed (not including the entering sequence)
    
    /**
     * Constructor
     * @param modelAnimationsManager manages the animations for the model
     */
    constructor(modelAnimationsManager:IModelAnimationsManager)
    {
        super(modelAnimationsManager);
        
        this.damageDealt = 10;
        
        this._buzzSoundKey = "/models/Monsters/ElectricHornet/sounds/buzz.mp3";
    }
    
    /**
     * Loads the assets for the model
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    load(assetHandler:IAssetHandler):void
    {
        super.load(assetHandler);
        
        const buzzSound = assetHandler.loadAudio(this._buzzSoundKey);
        
        this.sounds.push({
            key: this._buzzSoundKey,
            asset: buzzSound
        });
        this.assetsToUnload.push(this._buzzSoundKey);
        
        const spritesheetPath = "/models/Monsters/ElectricHornet/anim/electricHornet_spritesheet.png";
        this.assetsToUnload.push(spritesheetPath);
        this.spritesheet = assetHandler.loadImage(spritesheetPath);
        
        const damageFlashImagePath = "/HUDComponents/DamageFlash/images/yellow.png";
        this.damageFlashImage = assetHandler.loadImage(damageFlashImagePath);
        this.assetsToUnload.push(damageFlashImagePath);
    }
    
    registerAnimations():void
    {
        super.registerAnimations();
        
        this.animationManager.registerAnimations({
            flapping: this.animationManager.createAnimation({
                spritesheet: this.spritesheet!,
                fps: 27,
                drawWidth: 337,
                drawHeight: 315,
				frameCoordinates: [
					{ x: 0, y: 0, width: 557, height: 435 },
                    { x: 0, y: 433, width: 557, height: 435 }
				],
            })
        });
    }
    
    prepare():void
    {
        super.prepare();
        
        const level = (Kernel.getInstance().level as ASLevel);
        
        this.actions = [
            this._fly,
            this._drop,
            this._rise
        ];
        
        this.offScreenUnits = 500;
        this.startY = 200;
        this.startX = level.rightEdge + this.offScreenUnits;
        this.startZ = this.playerModel?.z ?? 0;
        this.y = this.startY;
        this.x = this.startX;
        this.z = this.startZ;
        
        this.enterXSpeed = 90;
        this.exitXSpeed = 240;
        this._startXSpeed = -400;
        this.xSpeed = this._startXSpeed;
        this.ySpeed = 1250;
        
        this._initialDropWait = 4000;
        this._firstDropTimeMS = 0;
        
        this.state = "flapping";
    }
    
    act(): void {
        super.act();
        const soundEngine = Kernel.getInstance().soundEngine;
        
        soundEngine.setSoundVolume(this._buzzSoundKey, this.getVolumeForDistance());
    }
    
    // Hit boxes for collision --------------------------------------------------------
    getHitBoxes():IHitBox[]
    {
        if(this.currentAction !== 0)
            return [
                {
                    x: this.x + (this.width / 2.7),
                    y: this.y + (this.height / 1.4),
                    z: this.z,
                    width: this.width / 3.7,
                    height: this.height / 3.8
                }
            ];
        
        return [];
    }
    
    // Entering, exiting and resetting-----------------------------------------
    
    start(): void {
        super.start();
        Kernel.getInstance().soundEngine.playSound(this._buzzSoundKey, true);
    }
    
    enter():void
    {
        const kernel = Kernel.getInstance();
        const level = (kernel.level as ASLevel);
        
        const thisRightEdge = this.x + this.width;
        if(level.rightEdge < thisRightEdge)
        {
            this.moveLeft(this.enterXSpeed);
        }
        else
        {
            const currentMS = kernel.totalLevelActiveMilliseconds;
            this._firstDropTimeMS = currentMS + this._initialDropWait;
            
            this.entering = false;
        }
    }
    
    exit():void
    {
        if(this.y != this.startY)
        {
            this._rise();
        }
        else
        {        
            this.moveLeft(this.exitXSpeed);
            
            const level = (Kernel.getInstance().level as ASLevel);
            
            const thisRightEdge = this.x + this.width;
            const exitEndPosition = level.leftEdge - this.offScreenUnits;
            if(thisRightEdge < exitEndPosition)
                this._handleExitCompletion();
        }
    }
    
    /**
     * Is this monster currently attacking?
     */
    isAttacking():boolean {
        return this.currentAction === 1;
    }
    
    /**
     * Should the hornet be attacking the player at this time?
     * @returns true if the hornet should be attacking, otherwise false
     */
    private _shouldBeAttacking():boolean
    {
        const currentMS = Kernel.getInstance().totalLevelActiveMilliseconds;
        
        return this.playerModel!.health > 0 && currentMS > this._firstDropTimeMS;
    }
    
    /**
     * Has the hornet hit one of the level's edges?
     * @returns true if the hornet has hit one of the level's edges, otherwise false
     */
    private _hasHitLevelEdge():boolean
    {
        const level = (Kernel.getInstance().level as ASLevel);
        
        const hasHitLeftEdge = this.x <= level.leftEdge && this.xSpeed < 0;
        
        const hornetRightSide = this.x + this.width
        const hasHitRightEdge = hornetRightSide >= level.rightEdge && this.xSpeed > 0;
        
        return hasHitLeftEdge || hasHitRightEdge;
    }
    
    /**
     * Sets the hornet's X/Y speeds to home in on the player
     */
    private _setHomingMovementDirection()
    {
        const playerXCenter = (this.playerModel!.width / 2) + this.playerModel!.x;
        const playerYCenter = (this.playerModel!.height / 2) + this.playerModel!.y;
        const thisXCenter = (this.width / 2) + this.x;
        const stingerY = (this.height * 0.9) + this.y;
        
        const distanceToPlayerXCenter = playerXCenter - thisXCenter;
        const distanceToPlayerYCenter = playerYCenter - stingerY;
        
        const speedMultiplier = 3.5;
        
        // (xSpeed can be a negative value, to move left)
        this.xSpeed = distanceToPlayerXCenter * speedMultiplier;
        this.ySpeed = distanceToPlayerYCenter * speedMultiplier;
    }
    
    /**
     * Should be called once the monster has left the screen on exiting
     */
    private _handleExitCompletion():void
	{
		this.exiting = false;
    	this.active = false;
        
        const soundEngine = Kernel.getInstance().soundEngine;
        soundEngine.stopSound(this._buzzSoundKey);
	}
    
    // Monster actions -----------------------------------------------------
    
    /**
     * Regular flying back and forth
     */
    private _fly():void
    {
        if(this._hasHitLevelEdge())
            this.xSpeed = -this.xSpeed;
        
        this.moveRight(); // X speed can be a negative number, to move left
        
        if(this._shouldBeAttacking())
            this._triggerDrop();
    }
    
    /**
     * Aims the hornet at the player, and moves to the next action (the drop attack)
     */
    private _triggerDrop()
    {
        this._setHomingMovementDirection();
        this.nextAction();
    }
    
    /**
     * Drops down to attack
     */
    private _drop():void
    {
        this.moveDown();
        this.moveRight();
    }
    
    /**
     * Rise back up, after an attack
     */
    private _rise():void
    {
        this.moveUp();
        
        if(this.y <= this.startY)
        {
            this.y = this.startY;
            this.xSpeed = this._startXSpeed;
            this.nextAction();
        }
    }
    
    
    // Events------------------------------------------------------

    zCollisionEventAction():void
    {
        this.nextAction();
    }
    
    /**
     * Runs any extra event checks specific to this model
     */
    checkForExtraEvents():void
    {
        super.checkForExtraEvents();
        
        const thisBottom = this.y + this.height;
        const attackYLimit = this.playerModel!.y + 50;
        
        // Check for missing the player on an attack
        if(this.isAttacking() && thisBottom > attackYLimit)
            this.nextAction();
    }
}