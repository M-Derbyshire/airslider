import Kernel from '../../../../Kernel/Kernel';
import ASLevel from '../../../levels/ASLevel/ASLevel';
import IModel, { IHitBox } from '../../../../Kernel/entities/Model/IModel';
import IModelAnimationsManager from '../../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';
import Monster from '../../Monster/Monster';

/**
 * The ghost monster
 */
export default class Ghost extends Monster {
    /**
     * The current damage dealt by this monster
     */
    damageDealt:number;
    
    // The maximum damage value this monster can have (damageDealt is the damage currently dealt by the monster)
    private _damageDealtOriginal:number;
    
    private _directionMultiplier:number; // The X-axis speed can be multiplied by this; Negate this to change direction
    private _exitZSpeed:number; // The speed that this monster should exit the level, on the Z-axis
    private _attackingZSpeed:number; // The Z-axis speed to use when attacking
    private _maxAttackingXSpeed:number; // The maximum X-axis speed to use when attacking
    
    private _outLimit:number; // How far back will the monster go, before moving forward
    private _inLimit:number; // The point when the monster will start its sweeping again, after moving back from an attack
    
    private _startPosition:ghostStartPosition; // Determines the starting X-axis position
    
    private _playerModel:IModel; // The player's character model
    
    /**
     * Constructor
     */
    constructor(playerModel:IModel, startPosition:ghostStartPosition)
    {
        super();
        
        this._damageDealtOriginal = 5;
        this._playerModel = playerModel;
        this._startPosition = startPosition;
    }
    
    load(animationManager:IModelAnimationsManager):void
    {
        super.load(animationManager);
        
        const assetHandler = Kernel.getInstance().assetHandler;
        
        const damageFlashSpritesheet = "/HUDComponents/DamageFlash/images/ghost.png";
        this.damageFlashImage = assetHandler.loadImage(damageFlashSpritesheet);
        this.assetsToUnload.push(damageFlashSpritesheet);
        
        const spritesheetPath = "/models/monsters/Ghost/anim/ghost-spritesheet.png";
        this.assetsToUnload.push(spritesheetPath);
        this.spritesheet = assetHandler.loadImage(spritesheetPath);
        
        this.animationManager.registerAnimations({
            normal: this.animationManager.createAnimation({
                spritesheet: this.spritesheet,
                fps: 24,
                drawWidth: 175,
                drawHeight: 170,
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
        
        const level = (Kernel.getInstance().level as ASLevel);
        const vpDepth = level.vanishingPointDepth;
        
        this.actions = [
            this.attack,
            this.moveUp
        ];
        
        this.state = "normal";
        
        // outLimit is how far back the monster will go, before moving forward.
        // inLimit is the point it will start attacking again
        this._outLimit = 1;
        this._inLimit = 180;
        const attackSpaceDepth = this._inLimit - this._outLimit;
        
        this.startZ = (this._startPosition === "left")
            ? vpDepth
            : vpDepth + attackSpaceDepth;
        this.startX = (this._startPosition === "left")
            ? level.leftEdge
            : (level.rightEdge - this.width);
        
        this.setYPositionFromBottom(this.height);
        this.x = this.startX;
        this.z = this.startZ;
        
        // Initial speed values
        this.zSpeed = 70;
        this.xSpeed = 350;
        this._directionMultiplier = 1;
        
        this._exitZSpeed = 70;
        this._attackingZSpeed = 100;
        this._maxAttackingXSpeed = 500;
        
        this.damageDealt = this._damageDealtOriginal;
    }
    
    /**
     * Is this monster currently attacking?
     */
    isAttacking():boolean {
        return true;
    }
    
    //Entering, Exiting and reseting-----------------------------------------
    
    enter():void
    {
        this._handleMonsterOverlappingLevelEdges();
        
        this.moveRight(this.xSpeed * this._directionMultiplier); // If the speed is negative, it moves left
        this.moveOut(this._attackingZSpeed);
        
        if(this.z <= this._inLimit) {
            this._handleMonsterReachingInLimit();
            this.entering = false;
        }
    }
    
    exit():void
    {
        this.moveIn(this._exitZSpeed);
        
        if(this.z >= this.startZ)
        {
            this.exiting = false;
            this.active = false;
        }
    }
    
    // Actions for movement-----------------------------------------------------
    
    /**
     * Attacking movement
     */
    attack():void
    {
        this._handleMonsterOverlappingLevelEdges();
        
        this.xSpeed = this._getXSpeedTargetedAtPlayer();
        
        this.moveRight(this.xSpeed); // If the xSpeed is negative, it moves left
        this.moveOut(this._attackingZSpeed);
        
        if(this.z <= this._outLimit)
            this._handleMonsterReachingOutLimit();
    }
    
    /**
     * Moves the monster away from the camera
     */
    moveUp():void
    {
        this._handleMonsterOverlappingLevelEdges();
        
        this.moveIn(this._attackingZSpeed);
        this.moveRight(); // Uses the last speed used by the attacking movement
        
        if(this.z >= this._inLimit)
            this._handleMonsterReachingInLimit();
    }
	
    /**
     * Keeps the monster within the X-axis edges of the level;
     */
	private _handleMonsterOverlappingLevelEdges():void
	{
        const level = (Kernel.getInstance().level as ASLevel);
        
		if(this.x < level.leftEdge)
        {
            this.x = level.leftEdge;
            this._directionMultiplier = 1;
        } else if (this.x + this.width > level.rightEdge)
        {
            this.x = level.rightEdge - this.width;
            this._directionMultiplier = -1;
        }
	}
    
    /**
     * Keeps the monster from coming too far towards the camera
     */
	private _handleMonsterReachingOutLimit():void
	{
		this.z = this._outLimit;
        this._handleMonsterReachingZSpaceLimit();
	}
	
    /**
     * Keeps the monster from going too far away from the camera (not including enter/exit)
     */
	private _handleMonsterReachingInLimit():void
	{
		this.z = this._inLimit;
        this._handleMonsterReachingZSpaceLimit();
	}
    
    /**
     * Handles a situation where the monster is moving out of its attack zone (on the Z-axis)
     */
    private _handleMonsterReachingZSpaceLimit():void
    {
        this.damageDealt = this._damageDealtOriginal;
		this.nextAction();
    }
    
    /**
     * Generates an X-axis speed that will aim the monster's movement towards
     * the player 
     */
    private _getXSpeedTargetedAtPlayer():number
    {
        const homingSpeed = 100 / this._maxAttackingXSpeed;
		
        const playerCenter = (this._playerModel.x + (this._playerModel.width / 2));
        const obstacleCenter = (this.x + (this.width / 2));
        
        let newSpeed = (playerCenter - obstacleCenter) / homingSpeed;
        
        if(Math.abs(newSpeed) > this._maxAttackingXSpeed)
            newSpeed = (newSpeed < 0)
                ? -this._maxAttackingXSpeed
                : this._maxAttackingXSpeed;
        
		return newSpeed;
    }
    
    // Events ------------------------------------------------------------
    
    /**
     * Creates and returns the current array of hit boxes for the model.
     * @returns An array of box's that can be used for events (e.g. boxes covering a character, for use by collision events)
     */
    getHitBoxes():IHitBox[]
    {
        const graceAreaWidth = this.width / 10;
        
        return [
            {
                x: this.x + graceAreaWidth,
                y: this.y,
                z: this.z,
                width: this.width - (graceAreaWidth * 2),
                height: this.height
            }
        ];
    }
    
    /**
     * What to do when the player collides with this monster
     * @param otherModel the player
     */
    zCollisionEventAction(_:IModel):void
    {
        this.damageDealt = 0; // We only want to do damage once, on the collision
    }
}

type ghostStartPosition = "left"|"right";