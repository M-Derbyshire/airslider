import IModel from '../../Model/IModel';
import Monster from '../../Monster/Monster';
import Tarian from '../../Tarian/Tarian';

/**
 * The ghost monster
 */
export default class Ghost extends Monster {
    
    /**
     * The total dmamage value this monster can have
     */
    damageDealtOrig:number;
    
    /**
     * The current damage dealt by this monster
     */
    damageDealt:number;
    
    /**
     * The speed that this monster should exit at, on the z axis
     */
    exitZSpeed:number;
    
    private _playerModel:Tarian; // The player's model
    private _minXSpeed:number;
    private _maxXSpeed:number;
    private _directionMultiplier:number;
    
    //outLimit is how far back the monster will go, before moving forward
    //inLimit is the point it will start it's sweeping again
    private _outLimit:number;
    private _inLimit:number;
    
    
    
    /**
     * Constructor
     * @param playerModel 
     */
    constructor(playerModel:Tarian)
    {
        super();
        
        this._playerModel = playerModel;
        
        this.damageDealtOrig = 2;
    }
    
    load():void
    {
        super.load();
        
        const damageFlashSpritesheet = "/assets/HUDs/components/DamageFlash/images/ghost.png";
        this.damageFlashImage = this.kernel.loadImage(damageFlashSpritesheet);
        this.assetsToUnload.push(damageFlashSpritesheet);
        
        const spritesheetPath = "/assets/models/monsters/Ghost/anim/ghost-spritesheet.png";
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
        
        this.exitZSpeed = 50;
        this.state = "normal";
        
        this.setYPositionFromBottom(this.height);
        this.startY = this.y;
        this.centerXPosition();
        this.startX = this.x
        this.startZ = this.helpers.zCalc.vPointDepth;
        this._minXSpeed = 1000;
        this._maxXSpeed = 2000;
        this.zSpeed = 12; // this will be multiplied by 10, as 120 was affecting Tarian's zCollision event
        
        //outLimit is how far back the monster will go, before moving forward
        //inLimit is the point it will start it's sweeping again
        this._outLimit = 1;
        this._inLimit = (this._playerModel.z + 100);
        
        this.xSpeed = this._minXSpeed;
        this.y = this.startY;
        this.x = this.startX;
        this.z = this.startZ;
        this._directionMultiplier = 1; //Multiply speed by this; Negate to change direction
        this.damageDealt = this.damageDealtOrig;
    }
    
    //entering and exiting and reseting-----------------------------------------
    
    enter():void
    {
        this.entering = false; //go straight to the sweeping
    }
    
    exit():void
    {
        //move
        this.moveIn(this.exitZSpeed);
        
        if(this.z >= this.startZ)
        {
            this.exiting = false;
            this.active = false;
        }
    }
    
    //movement-----------------------------------------------------
    
    /**
     * Generates a new speed for the monster
     * @returns the new speed
     */
    private _getNewSpeed():number
    {
        return this._minXSpeed + (Math.random() * (this._maxXSpeed - this._minXSpeed));
    }
    
    /**
     * Sweeping movement
     */
    sweep():void
    {
        this._handleMonsterOverlappingLevelEdges();
		
        this.moveRight(this.xSpeed * this._directionMultiplier);
        
        this.moveOut(this.zSpeed * 10);
        
        if(this.z <= this._outLimit)
        {
            this._handleMonsterReachingOutLimit();
        }
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
     * Keeps the monster from coming to far out on the z axis
     */
	private _handleMonsterReachingOutLimit():void
	{
		this.z = this._outLimit;
        this.nextAction();
	}
	
    /**
     * Moves the monster away from the camera
     */
    moveUp():void
    {
        this.moveIn(this.zSpeed * 10);
        
        if(this.z >= this._inLimit)
        {
            this._handleMonsterReachingInLimit();
        }
    }
	
    /**
     * Keeps the monster from going to far in on the z axis
     */
	_handleMonsterReachingInLimit():void
	{
		this.xSpeed = this._getNewSpeed();
		this.z = this._inLimit;
		this.damageDealt = this.damageDealtOrig;
		this.nextAction();
	}
    
    
    //events------------------------------------------------------------
    
    /**
     * What to do when the player collides with this monster
     * @param otherModel the player
     */
    zCollisionEventAction(otherModel:IModel):void
    {
        if(this.currentAction == 0 && !this.exiting) //the index number of the current action method in the array in Monster class
        {
            this.z = otherModel.z + this.zSpeed + 1;
            this.damageDealt = 0; //in case it's still colliding (will be reset when it gets to the inLimit)
            this.nextAction();
        }
    }
}