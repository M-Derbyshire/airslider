import Kernel from '../../../../Kernel/Kernel';
import IHitBox from '../../../../Kernel/entities/Model/IHitBox';
import IModelAnimationsManager from '../../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';
import Monster from '../../Monster/Monster';
import Tarian from '../../Tarian/Tarian';

/**
 * The Electric Hornet monster
 */
export default class ElectricHornet extends Monster {
    
    private _buzzSound:HTMLAudioElement; // The buzzing sound effect
    
    private _dropWaitOffset:number; // The minimum amount of milliseconds between dropping for attacks
    private _dropWaitRange:number; // The maximum amount of milliseconds to wait (after the drop wait offset) before attacking
    private _initialDropWait:number; // The amount of milliseconds before the first attack
    private _nextDropTime:number|null; // The next time (in milliseconds) to attack. Should be set to null initially
    
    private _startXSpeed:number; // The initial x speed (not including the entering sequence)
    
    /**
     * Constructor
     * @param playerModel The model of the player
     */
    constructor(playerModel:Tarian)
    {
        super();
        
        this.playerModel = playerModel;
        this.damageDealt = 10;
    }
    
    load(animationManager:IModelAnimationsManager):void
    {
        super.load(animationManager);
        
        const kernel = Kernel.getInstance();        
        
        const buzzSoundPath = "/models/monsters/ElectricHornet/sounds/buzz.mp3";
        this._buzzSound = kernel.loadAudio(buzzSoundPath);
        this.assetsToUnload.push(buzzSoundPath);
        
        const spritesheetPath = "/models/monsters/ElectricHornet/anim/electricHornet_spritesheet.png";
        this.assetsToUnload.push(spritesheetPath);
        
        this.animationManager.registerAnimations({
            flapping: this.animationManager.createAnimation({
                sheetPath: spritesheetPath,
                fps: 27,
                drawWidth: 337,
                drawHeight: 315,
				frameCoordinates: [
					{ x: 0, y: 0, width: 557, height: 435 },
                    { x: 0, y: 433, width: 557, height: 435 }
				],
            })
        });
        
        const damageFlashImagePath = "/HUDComponents/DamageFlash/images/yellow.png";
        this.damageFlashImage = kernel.loadImage(damageFlashImagePath);
        this.assetsToUnload.push(damageFlashImagePath);
    }
    
    prepare():void
    {
        super.prepare();
        
        this.actions = [
            this._fly,
            this._drop,
            this._rise
        ];
        
        this.offScreenUnits = 500;
        this.startY = 100;
        this.startX = this.levelRightEdge + this.offScreenUnits;
        this.startZ = this.playerModel.z;
        this.y = this.startY;
        this.x = this.startX;
        this.z = this.startZ;
        
        this.enterXSpeed = 90;
        this.exitXSpeed = 240;
        this._startXSpeed = -400;
        this.xSpeed = this._startXSpeed;
        this.ySpeed = 1250;
        
        // How long till the hornet will drop?
        this._dropWaitOffset = 2000; // 2 seconds
        this._dropWaitRange = 2000;
        this._initialDropWait = 4000;
        this._nextDropTime = null;
        
        this.state = "flapping";
    }
    
    act(): void {
        super.act();
        this._buzzSound.volume = this.getVolumeForDistance();
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
        Kernel.getInstance().soundEngine.playSound(this._buzzSound, true);
    }
    
    enter():void
    {
        if(this.levelRightEdge < (this.x + this.width))
        {
            this.moveLeft(this.enterXSpeed);
        } else {
            this.entering = false;
            this._nextDropTime = Kernel.getInstance().totalLevelActiveMilliseconds + this._initialDropWait;
        }
    }
    
    exit():void
    {
        if(this.y != this.startY) // if not at the correct y position, don't leave yet
        {
            this._rise();
        } else {        
            this.moveLeft(this.exitXSpeed);
            
            if((this.x + this.width) < (this.levelLeftEdge - this.offScreenUnits))
                this._handleMonsterExitingScreen();
        }
    }
    
    /**
     * Is this monster currently attacking?
     */
    isAttacking():boolean {
        return this.currentAction === 1;
    }
    
    /**
     * Should be called once the monster has left the screen on exiting
     */
    private _handleMonsterExitingScreen():void
	{
		this.exiting = false;
    	this.active = false;
        Kernel.getInstance().soundEngine.stopSound(this._buzzSound);
	}
    
    // Monster actions -----------------------------------------------------
    
    /**
     * Regular flying back and forth
     */
    private _fly():void
    {
        // Handle collision with level edges (if the model is over an edge, and still moving in that direction)
        if((this.x <= this.levelLeftEdge && this.xSpeed < 0) || 
            ((this.x + this.width) >= this.levelRightEdge && this.xSpeed > 0))
        {
            this.xSpeed = -this.xSpeed;
        }
        
        this.moveRight(this.xSpeed); // Can be a negative number, to move left
        
        // Determine if the monster should start to attack
        if(this._nextDropTime === null)
        {
            this._nextDropTime = this._getNextDropTime();
        } 
        else if(Kernel.getInstance().totalLevelActiveMilliseconds >= this._nextDropTime)
        {
            this._triggerDrop();
        }
    }
    
    /**
     * Creates a randomised time for the next attack (bearing in mind the dropWaitOffset and dropWaitRange) in milliseconds
     * @returns The new time (in milliseconds) for the next attack
     */
    private _getNextDropTime():number
	{
        const currentTime = Kernel.getInstance().totalLevelActiveMilliseconds;
		return currentTime + this._dropWaitOffset + Math.floor(Math.random() * this._dropWaitRange);
	}
    
    /**
     * Sets the x/y speeds to aim at the player, and moves to the next action (to the drop attack)
     */
    private _triggerDrop()
    {
        this._nextDropTime = null;
        
        // We need to calculate the x/y speed needed to get to the player (xSpeed can be a negative value, to move left)
        const distanceToPlayerTop = this.playerModel.y - (this.y + this.height);
        const playerXCenter = (this.playerModel.width / 2) + this.playerModel.x;
        const thisXCenter = (this.width / 2) + this.x;
        const distanceToPlayerXCenter = playerXCenter - thisXCenter;
        
        const speedMultiplier = 2.75;
        
        this.xSpeed = distanceToPlayerXCenter * speedMultiplier;
        this.ySpeed = distanceToPlayerTop * speedMultiplier;
        
        this.nextAction();
    }
    
    /**
     * Drops down to attack
     */
    private _drop():void
    {
        this.moveDown(this.ySpeed);
        this.moveRight(this.xSpeed);
    }
    
    /**
     * Rise back up, after an attack
     */
    private _rise():void
    {
        this.moveUp(this.ySpeed);
        
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
    
    extraEvents():void
    {
        // Check for missing the player on an attack
        if(this.isAttacking() && (this.y + this.height) > (this.playerModel.y + 100))
            this.nextAction();
    }
}