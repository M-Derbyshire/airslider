import Kernel from '../../../../Kernel/Kernel';
import IHitBox from '../../../../Kernel/entities/Model/IHitBox';
import IAnimation from '../../../../Kernel/entities/Model/ModelAnimationsManager/IAnimation';
import IModelAnimationsManager from '../../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';
import ASLevel from '../../../levels/ASLevel/ASLevel';
import Monster from '../../Monster/Monster';
import PidgeonSoundController from './PidgeonSoundController';

/**
 * The Neon Pidgeon monster (there should be 2 in the level, at the same time)
 */
export default class NeonPidgeon extends Monster {
    // How far over the edges of the level should the pidgeon be able to go (Without this, the player
    // can just stay on the edge of the level, and not get hit)
    private _edgeOverflow:number;
    
    private _flapSoundKey:string; // The key for the wings flapping sound effect
    private _soundController:PidgeonSoundController; // Controls sound effects for all pidgeons
    
    private _higherPidgeonModel?:NeonPidgeon; // the pidgeon that's flying above this one is stored here (If this one is the lower one)
    
    private _overlapping:boolean; // Is this pidgeon's X-axis position currently overlapping the player's?
    private _nextDrop:number; // The time for the next drop attack (in milliseconds)
    private _dropWaitOffset:number; // A minimum span of time (in milliseconds) between each drop attack
    private _dropWaitRange:number; // A span of time (milliseconds). The total amount that can be added to the dropWaitOffset, to get a new drop time.
    private _initialDropWait:number; // The amount of time (in milliseconds) the monster will wait before its initial drop attack
    private _dropYSpeed:number; // The movement speed on the Y-axis, when dropping/rising
    
    private _higherPidgeonSteadyY:number; // The standard Y-axis position of the higher pidgeon
    private _lowerPidgeonSteadyY:number; // The standard Y-axis position of the lower pidgeon
    private _steadyY:number; // The standard Y-axis position of this pidgeon, as it flys back and forth
    private _extraOffScreenYPosOffset:number; // This value adds extra units to what we consider to be "off screen" (on the Y-axis)
    
    /**
     * How much damage does this monster do?
     */
    damageDealt:number;
    
    /**
     * Constructor
     * @param higherPidgeon The pidgeon that will be above this pidgeon (if this pidgeon is the lower one)
     */
    constructor(higherPidgeon?:NeonPidgeon)
    {
        super();
        
        this._higherPidgeonModel = higherPidgeon;
        
        this._flapSoundKey = "/models/monsters/NeonPidgeon/sounds/flap.mp3";
        
        this.damageDealt = 10;
        
        this._extraOffScreenYPosOffset = 75;
        this._higherPidgeonSteadyY = 150;
        this._lowerPidgeonSteadyY = 250;
        this._steadyY = !this._higherPidgeonModel
            ? this._higherPidgeonSteadyY
            : this._lowerPidgeonSteadyY;
    }
    
    load(animationManager:IModelAnimationsManager):void
    {
        super.load(animationManager);
        
        const assetHandler = Kernel.getInstance().assetHandler;
        
        const fullModelWidth = 337;
        this._edgeOverflow = fullModelWidth / 2;
        
        const damageFlashSpritesheet = "/HUDComponents/DamageFlash/images/none.png";
        this.damageFlashImage = assetHandler.loadImage(damageFlashSpritesheet);
        this.assetsToUnload.push(damageFlashSpritesheet);
        
        const flapSound = assetHandler.loadAudio(this._flapSoundKey);
        
        this.sounds.push({
            key: this._flapSoundKey,
            asset: flapSound
        });
        this.assetsToUnload.push(this._flapSoundKey);
        
        const spritesheetPath = "/models/monsters/NeonPidgeon/anim/neonPidgeon-spritesheet.png";
        this.assetsToUnload.push(spritesheetPath);
        
        this.animationManager.registerAnimations({
            falling: this.animationManager.createAnimation({
                sheetPath: spritesheetPath,
                fps: 24,
                drawWidth: 250,
                drawHeight: 200,
				frameCoordinates: [
					{ x: 0, y: 0, width: fullModelWidth, height: 240 },
				],
            }),
            flapping: this.animationManager.createAnimation({
                sheetPath: spritesheetPath,
                fps: 24,
                drawWidth: 250,
                drawHeight: 200,
				frameCoordinates: [
					{ x: 0, y: 242, width: fullModelWidth, height: 228 },
					{ x: 0, y: 471, width: fullModelWidth, height: 228 },
					{ x: 0, y: 700, width: fullModelWidth, height: 228 },
					{ x: 0, y: 929, width: fullModelWidth, height: 228 },
					{ x: 0, y: 1158, width: fullModelWidth, height: 228 },
					{ x: 0, y: 1387, width: fullModelWidth, height: 228 },
					{ x: 0, y: 1616, width: fullModelWidth, height: 228 },
					{ x: 0, y: 1845, width: fullModelWidth, height: 228 },
				],
            }),
            rising: this.animationManager.createAnimation({
                sheetPath: spritesheetPath,
                fps: 24,
                drawWidth: 250,
                drawHeight: 200,
				frameCoordinates: [
					{ x: 0, y: 2074, width: fullModelWidth, height: 240 },
				],
            }),
        });
    }
    
    prepare():void
    {
        super.prepare();
        
        this.state = "flapping";
        
        this.actions = [
            this.moveSideways,
            this.drop,
            this.rise
        ];
        
        this._resetPositionValues();
        this._resetSpeedValues();
        
        this._resetDropValues();
        
        if(this._higherPidgeonModel)
            this._soundController = new PidgeonSoundController(this._higherPidgeonModel, this);
    }
    
    act():void
    {
        super.act();
        
        this._preDrawSynchronise();
        
        if(this._soundController)
        {
            const soundEngine = Kernel.getInstance().soundEngine;
            
            soundEngine.setSoundVolume(this._flapSoundKey, this.getVolumeForDistance());
            this._soundController.act(this._flapSoundKey);
        }
    }
    
    /**
     * Is this monster currently attacking?
     */
    isAttacking():boolean {
        return (this.state === "falling");
    }
    
    /**
     * Gets the flapping animation object from the model's animation manager
     */
    getFlappingAnimation():IAnimation
    {
        return this.animationManager.animations.flapping;
    }
    
    /**
     * Sets the flapping animation object in the model's animation manager
     */
    setFlappingAnimation(newAnim:IAnimation):void
    {
        this.animationManager.animations.flapping = newAnim;
    }
    
    /**
     * Before being drawn, the pidegons need to be synchronised in certain ways (for
     * example, if both are flapping, their animations will need to be synced to ensure
     * the sound effect is timed correctly)
     */
    private _preDrawSynchronise():void
    {
        if(!this._higherPidgeonModel)
            return;
        
        // The pidgeon's flapping animations should be kept synced (otherwise the flapping sound can be inconsistent)
        
        const lowPidgeonAnimation = this.getFlappingAnimation();
        const highPidgeonAnimation = this._higherPidgeonModel.getFlappingAnimation();
        const animName = "flapping";
        
        const shouldSyncAnimations = (
            this.state === animName
            && this._higherPidgeonModel.state === animName
            && highPidgeonAnimation.currentFrameIndex !== lowPidgeonAnimation.currentFrameIndex
        );
        
        if(shouldSyncAnimations)
            this._higherPidgeonModel.setFlappingAnimation({ ...lowPidgeonAnimation });
    }
    
    // Hit boxes --------------------------------------------------------
    
    getHitBoxes():IHitBox[]
    {
        if(this.state === "falling")
        {
            return [
                {
                    // Wings
                    x: this.x,
                    y: this.y + (this.height / 2.5),
                    z: this.z,
                    width: this.width,
                    height: this.height / 4
                },
                {
                    // Body
                    x: this.x + (this.width / 2.24),
                    y: this.y,
                    z: this.z,
                    width: this.width / 8,
                    height: this.height
                }
            ];
        }
        
        return [];
    }
    
    //Entering, exiting and resetting -----------------------------------------
    
    start(): void {
        super.start();
        Kernel.getInstance().soundEngine.forceSoundToLoad(this._flapSoundKey);
    }
    
    enter():void
    {
        const kernel = Kernel.getInstance();
        
        if(this.y < this._steadyY)
        {
            this.moveDown(this.enterYSpeed);
        } else {
            this.y = this._steadyY;
            this.entering = false;
            this._nextDrop = kernel.totalLevelActiveMilliseconds + this._initialDropWait;
        }
    }
    
    exit():void
    {
        if(this.y > this._steadyY) // If not at correct height, don't leave yet (may be mid-drop)
        {
            this.state = "rising";
            this.rise();
        }
        else
        {
            this.state = "flapping";
        
            this.moveUp(this.exitYSpeed);
            
            
            if((this.y + this.height) < -this._extraOffScreenYPosOffset)
                this._handleMonsterExitingScreen();
        }
    }
	
    /**
     * Handle the monster leaving the screen, on exit
     */
	private _handleMonsterExitingScreen():void
	{
        this.exiting = false;
        this.active = false;
	}
    
    /**
     * Resets the values associated with the model's positioning
     * at different points during the level
     */
    private _resetPositionValues():void
    {
        const { leftEdge, rightEdge } = Kernel.getInstance().level as ASLevel;
        const levelCenter = (rightEdge - leftEdge) / 2;
        
        const isLowerPidgeon = !!this._higherPidgeonModel;
        const yDifference = this._lowerPidgeonSteadyY - this._higherPidgeonSteadyY;
        
        const offScreenYPosition = -(this.height + this._extraOffScreenYPosOffset);
        this.startY = isLowerPidgeon
            ? offScreenYPosition
            : offScreenYPosition - yDifference;
        
        const xOffsetFromCenter = 100;
        
        this.startX = isLowerPidgeon
            ? (levelCenter - this.width) - xOffsetFromCenter
            : levelCenter + xOffsetFromCenter;
        
        this.startZ = this.playerModel.z;
        
        this.y = this.startY;
        this.x = this.startX;
        this.z = this.startZ;
    }
    
    /**
     * Resets the values associated with the model's speed
     */
    private _resetSpeedValues():void
    {
        const isLowerPidgeon = !!this._higherPidgeonModel;
        
        this._dropYSpeed = 1250;
        this.enterYSpeed = 45;
        this.exitYSpeed = 90;
        
        const xSpeed = 760;
        this.xSpeed = isLowerPidgeon ? xSpeed : -xSpeed;
    }
    
    /**
     * Resets the values associated with the dropping/rising
     * of the Pidgeon
     */
    private _resetDropValues():void
    {
        this._overlapping = false;
        this._dropWaitOffset = 1500;
        this._dropWaitRange = 1500;
        this._initialDropWait = 8000;
        this._nextDrop = -1;
    }
    
    // Actions -----------------------------------------------------
    
    /**
     * Handles the monster moving left and right
     */
    moveSideways():void
    {
        this.moveRight(); // X speed may be a negative number, to move left
        
        this._handleMonsterOverlappingLevelEdges();
        
        if(this._nextDrop === -1)
            this._nextDrop = this._getNextDropTime();
		else if(this._monsterShouldDrop())
            this._startMonsterDrop();
        
		// If this should be true, it will have been set to true by the
        // neonPidgeonOverlappingEventAction method, so we end on changing 
        // this back to false.
        this._overlapping = false;
    }
    
    /**
     * The monster diving down at the player
     */
    drop():void
    {
        this.moveDown(this._dropYSpeed);
    }
    
    /**
     * The monster rising back up
     */
    rise():void
    {
        this.moveUp(this._dropYSpeed);
        
        if(this.y <= this._steadyY)
        {
            this.y = this._steadyY;
            this.state = "flapping";
            this.nextAction();
        }
    }
	
    /**
     * Starts the monster's drop
     */
	private _startMonsterDrop():void
	{
		this._nextDrop = -1;
        this.state = "falling";
        this.nextAction();
	}
	
    /**
     * Generates the next time to drop
     * @returns the next time (in milliseconds)
     */
	private _getNextDropTime():number
	{
        const totalActiveMS = Kernel.getInstance().totalLevelActiveMilliseconds;
        
		return totalActiveMS + this._dropWaitOffset + Math.floor(Math.random() * this._dropWaitRange);
	}
	
    /**
     * Should the monster drop?
     * @returns true if the monster should drop, false if not
     */
	private _monsterShouldDrop():boolean
	{
        const totalActiveMS = Kernel.getInstance().totalLevelActiveMilliseconds;
        
		return (totalActiveMS >= this._nextDrop && this._overlapping);
	}
	
    /**
     * Stops the monster from going outside the level's edges
     */
	private _handleMonsterOverlappingLevelEdges():void
	{
        const level = (Kernel.getInstance().level as ASLevel);
        
        const overlappingLeftEdge = this.x <= (level.leftEdge - this._edgeOverflow);
        const overlappingRightEdge = this.x + this.width >= (level.rightEdge + this._edgeOverflow);
        
		if(overlappingLeftEdge || overlappingRightEdge)
        {
            this.xSpeed = -this.xSpeed;
            
            this.x = (this.xSpeed > 0) ? 
                (level.leftEdge - this._edgeOverflow + 1) :
                ((level.rightEdge - this.width) + this._edgeOverflow - 1);
        }
	}
    
    // Events------------------------------------------------------------
    
    /**
     * Any extra event checks specific to this model
     */
    protected extraEvents():void
    {
        super.extraEvents();
        
        if(this.hasHitGround() && this.state === "falling")
            this.hitEventAction();
    }
    
    /**
     * Handles the pidgeon's x position overlapping the player's x position
     */
    overlappingPlayerXEventAction():void
    {
        this._overlapping = true;
    }
    
    /**
     * Handles collision with the player or the ground while falling
     */
    hitEventAction():void
    {
        this.state = "rising";
        this.nextAction();
    }
}