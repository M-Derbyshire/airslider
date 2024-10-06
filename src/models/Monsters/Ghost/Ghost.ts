import Kernel from '../../../../Kernel/Kernel';
import ASLevel from '../../../levels/ASLevel/ASLevel';
import IModel from '../../../../Kernel/entities/Model/IModel';
import IModelAnimationsManager from '../../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';
import Monster from '../../Monster/Monster';
import Tarian from '../../Tarian/Tarian';

/**
 * The ghost monster
 */
export default class Ghost extends Monster {
    
    /**
     * The maximum damage value this monster can have (damageDealt is the damage currently dealt by the monster)
     */
    damageDealtOrig:number;
    
    /**
     * The current damage dealt by this monster
     */
    damageDealt:number;
    
    /**
     * The speed that this monster should exit the level, on the z axis
     */
    exitZSpeed:number;
    
    private _playerModel:Tarian; // The player's model
    private _minXSpeed:number; 
    private _maxXSpeed:number;
    private _directionMultiplier:number; // The x speed is multiplied by this; Negate it to change direction
    
    private _outLimit:number; // How far back will the monster go, before moving forward
    private _inLimit:number; // The point when the monster will start its sweeping again, after moving back from an attack
    
    /**
     * Constructor
     * @param playerModel The player's model
     */
    constructor(playerModel:Tarian)
    {
        super();
        
        this._playerModel = playerModel;
        this.damageDealtOrig = 2;
    }
    
    load(animationManager:IModelAnimationsManager):void
    {
        super.load(animationManager);
        
        const kernel = Kernel.getInstance();
        
        const damageFlashSpritesheet = "/HUDs/components/DamageFlash/images/ghost.png";
        this.damageFlashImage = kernel.loadImage(damageFlashSpritesheet);
        this.assetsToUnload.push(damageFlashSpritesheet);
        
        const spritesheetPath = "/models/monsters/Ghost/anim/ghost-spritesheet.png";
        this.assetsToUnload.push(spritesheetPath);
        
        this.animationManager.registerAnimations({
            normal: this.animationManager.createAnimation({
                sheetPath: spritesheetPath,
                fps: 24,
                drawWidth: 219,
                drawHeight: 212,
				frameCoordinates: [
					{ x: 0, y: 0, width: 319, height: 312 },
					{ x: 0, y: 313, width: 319, height: 312 },
					{ x: 0, y: 625, width: 319, height: 312 },
				]
            })
        });
        
    }
    
    prepare():void
    {
        super.prepare();
        
        this.actions = [
            this.sweep,
            this.moveUp
        ];
        
        this.state = "normal";
        
        this.startZ = (Kernel.getInstance().level as ASLevel).vanishingPointDepth;
        this.setYPositionFromBottom(this.height);
        this.startY = this.y;
        this.centerXPosition();
        this.startX = this.x;
        this.y = this.startY;
        this.x = this.startX;
        this.z = this.startZ;
        
        this.zSpeed = 120;
        this.exitZSpeed = 50;
        this._minXSpeed = 1000;
        this._maxXSpeed = 2000;
        this.xSpeed = this._minXSpeed;
        this._directionMultiplier = 1;
        
        //outLimit is how far back the monster will go, before moving forward
        //inLimit is the point it will start it's sweeping again
        this._outLimit = 1;
        this._inLimit = (this._playerModel.z + 100);
        
        this.damageDealt = this.damageDealtOrig;
    }
    
    //Entering, Exiting and reseting-----------------------------------------
    
    enter():void
    {
        this.entering = false; // Go straight to the sweeping
    }
    
    exit():void
    {
        this.moveIn(this.exitZSpeed);
        
        if(this.z >= this.startZ)
        {
            this.exiting = false;
            this.active = false;
        }
    }
    
    // Actions for movement-----------------------------------------------------
    
    /**
     * Sweeping movement
     */
    sweep():void
    {
        this._handleMonsterOverlappingLevelEdges();
		
        this.moveRight(this.xSpeed * this._directionMultiplier); // If the directionMultiplier is negative, it moves left
        this.moveOut(this.zSpeed);
        
        if(this.z <= this._outLimit)
            this._handleMonsterReachingOutLimit();
    }
    
    /**
     * Moves the monster away from the camera
     */
    moveUp():void
    {
        this.moveIn(this.zSpeed);
        
        if(this.z >= this._inLimit)
            this._handleMonsterReachingInLimit();
    }
	
    /**
     * Keeps the monster within the x edges of the level;
     */
	private _handleMonsterOverlappingLevelEdges():void
	{
		if(this.x < this.levelLeftEdge)
        {
            this.x = this.levelLeftEdge;
            this._directionMultiplier = 1;
        } else if (this.x + this.width > this.levelRightEdge)
        {
            this.x = this.levelRightEdge - this.width;
            this._directionMultiplier = -1;
        }
	}
	
    /**
     * Keeps the monster from coming too far towards the camera
     */
	private _handleMonsterReachingOutLimit():void
	{
		this.z = this._outLimit;
        this.nextAction();
	}
	
    /**
     * Keeps the monster from going too far away from the camera (not including enter/exit)
     */
	private _handleMonsterReachingInLimit():void
	{
		this.xSpeed = this._getNewSpeed();
		this.z = this._inLimit;
		this.damageDealt = this.damageDealtOrig;
		this.nextAction();
	}
    
    /**
     * Generates a new speed for the monster
     * @returns the new speed
     */
    private _getNewSpeed():number
    {
        return this._minXSpeed + (Math.random() * (this._maxXSpeed - this._minXSpeed));
    }
    
    
    // Events ------------------------------------------------------------
    
    /**
     * What to do when the player collides with this monster
     * @param otherModel the player
     */
    zCollisionEventAction(otherModel:IModel):void
    {
        if(this.currentAction === 0 && !this.exiting)
        {
            this.z = otherModel.z;
            this.damageDealt = 0; // We only want to do damage once on the collision (this is reset when it gets to the inLimit)
            this.nextAction();
        }
    }
}