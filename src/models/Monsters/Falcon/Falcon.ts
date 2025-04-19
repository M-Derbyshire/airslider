import Kernel from '../../../../Kernel/Kernel';
import IModel from '../../../../Kernel/entities/Model/IModel';
import IModelAnimationsManager from '../../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';
import TimeHelper from '../../../../Kernel/utils/TimeHelper';
import UnitHelper from '../../../../Kernel/utils/UnitHelper';
import Monster from '../../Monster/Monster';
import Tarian from '../../Tarian/Tarian';

/**
 * The falcon monster
 */
export default class Falcon extends Monster {
    
    /**
     * The player model
     */
    playerModel:Tarian;
    
    /**
     * Is this monster overlapping (on the x axis) the player?
     */
    overlapping:boolean;
    
    /**
     * The total damage that can be done by this monster
     */
    damageDealtOrig:number;
    
    /**
     * The current damage this monster will do
     */
    damageDealt:number;
    
    /**
     * In frames
     */
    dropWaitOffset:number;
    
    /**
     * In frames
     */
    dropWaitRange:number;
    
    lastSwoop:number;
    
    directionMultiplier:number;
    
    swoopWait:number;
    
    
    /**
     * Constructor
     * @param playerModel The model of the player
     */
    constructor(playerModel:Tarian)
    {
        super();
        
        this.playerModel = playerModel;
        
        this.damageDealtOrig = 12;
    }
    
    load(animationManager:IModelAnimationsManager):void
    {
        super.load(animationManager);
        
        const assetHandler = Kernel.getInstance().assetHandler;
        
        const damageFlashSpritesheet = "/HUDComponents/DamageFlash/images/none.png";
        this.damageFlashImage = assetHandler.loadImage(damageFlashSpritesheet);
        this.assetsToUnload.push(damageFlashSpritesheet);
        
        const spritesheet = "/models/monsters/Falcon/anim/falcon-spritesheet.png";
        this.assetsToUnload.push(spritesheet);
        
        this.animationManager.registerAnimations({
            dropLeft: this.animationManager.createAnimation({
                sheetPath: spritesheet,
                fps: 24,
                drawWidth: 175,
                drawHeight: 300,
				frameCoordinates: [
					{ x: 0, y: 0, width: 188, height: 151 },
				]
            }),
            dropRight: this.animationManager.createAnimation({
                sheetPath: spritesheet,
                fps: 24,
                drawWidth: 175,
                drawHeight: 300,
				frameCoordinates: [
					{ x: 0, y: 152, width: 188, height: 151 },
				]
            }),
            flapping: this.animationManager.createAnimation({
                sheetPath: spritesheet,
                fps: 24,
                drawWidth: 350,
                drawHeight: 200,
				frameCoordinates: [
					{ x: 0, y: 303, width: 398, height: 151 },
					{ x: 0, y: 455, width: 398, height: 151 },
					{ x: 0, y: 607, width: 398, height: 151 },
					{ x: 0, y: 759, width: 398, height: 151 },
					{ x: 0, y: 911, width: 398, height: 151 },
					{ x: 0, y: 1063, width: 398, height: 151 },
					{ x: 0, y: 1215, width: 398, height: 151 },
					{ x: 0, y: 1367, width: 398, height: 151 },
				]
            }),
            left: this.animationManager.createAnimation({
                sheetPath: spritesheet,
                fps: 24,
                drawWidth: 350,
                drawHeight: 200,
				frameCoordinates: [
					{ x: 0, y: 1519, width: 398, height: 151 },
				]
            }),
            right: this.animationManager.createAnimation({
                sheetPath: spritesheet,
                fps: 24,
                drawWidth: 350,
                drawHeight: 200,
				frameCoordinates: [
					{ x: 0, y: 1671, width: 398, height: 151 },
				]
            }),
            riseLeft: this.animationManager.createAnimation({
                sheetPath: spritesheet,
                fps: 24,
                drawWidth: 170,
                drawHeight: 300,
				frameCoordinates: [
					{ x: 0, y: 1823, width: 150, height: 187 },
				]
            }),
            riseRight: this.animationManager.createAnimation({
                sheetPath: spritesheet,
                fps: 24,
                drawWidth: 170,
                drawHeight: 300,
				frameCoordinates: [
					{ x: 0, y: 2011, width: 150, height: 187 },
				]
            }),
        });
        
    }
    
    prepare():void
    {
        super.prepare();
        
        this.actions = [
            this.stalking,
            this.strafe,
            this.swoopDown,
            this.swoopUp,
            this.reposition
        ];
        
        this.enterXSpeed = 140;
        this.offScreenUnits = 800;
        this.startY = 75;
        this.startX = this.levelLeftEdge - this.offScreenUnits;
        this.startZ = this.playerModel.z;
        this.dropWaitOffset = TimeHelper.secondsToFrames(5);
        this.dropWaitRange = TimeHelper.secondsToFrames(5);
        
        this.overlapping = false;
        this.lastSwoop = -1;
        this.directionMultiplier = 1; //1 for right, -1 for left
        this.swoopWait = 6000; // 6 seconds for first one (will be changed with random() later)
        this.y = this.startY;
        this.x = this.startX;
        this.z = this.startZ;
        
        //This means that if the player moves in the same direction 
        //during strafe(), the monster doesn't end up off screen.
        this.xSpeed = this.playerModel.topSpeed * 1.5;
        
        this.ySpeed = this.xSpeed;
        this.state = "flapping";
    }
    
    //entering and exiting and reseting-----------------------------------------
    
    enter():void
    {
        // move until centered above player
        if(this.x + (this.width / 2) < this.playerModel.x + (this.playerModel.width / 2))
        {
            this.moveRight(this.enterXSpeed);
        } else {
            this.lastSwoop = Kernel.getInstance().totalLevelActiveMilliseconds
            this.entering = false;
        }
    }
    
    exit():void
    {
        if(this.y === this.startY)
        {
            this.state = "flapping";
        
            this.moveRight(this.enterXSpeed);
            
            if(this.x > (this.levelRightEdge + this.offScreenUnits))
            {
                this.exiting = false;
                this.active = false;
            }
        } else {
            this.actions[this.currentAction].apply(this); //run the current action
        }
    }
    
    //movement-----------------------------------------------------
    
    stalking():void
    {
        //Reset the damage (It's set to 0 in swoopUp() to avoid dealing extra damage to the player)
        this.damageDealt = this.damageDealtOrig;
        
        //keep monster centered above player
        this.x = this.playerModel.x + (this.playerModel.width / 2) - (this.width / 2);
        
        const levelActiveMS = Kernel.getInstance().totalLevelActiveMilliseconds;
        if(levelActiveMS - this.lastSwoop >= this.swoopWait)
        {
            this.swoopWait = (Math.random() * 2000) + 500; //between 0.5 and 2 seconds
            // will set the lastSwoop time after swooping has finished (see reposition())
            
            this._setSwoopDirection();
            
            this.nextAction();
        }
    }
	
	private _setSwoopDirection():void
	{
		if(this.x + (this.width / 2) > (this.levelRightEdge - this.levelLeftEdge) / 2)
		{
			this.directionMultiplier = -1;
			this.state = "left";
		} else {
			this.directionMultiplier = 1;
			this.state = "right";
		}
	}
    
	
	
    strafe():void
    {
        if(this._isItTimeToSwoop())
        {
            this.directionMultiplier = -this.directionMultiplier;
            this.state = (this.directionMultiplier == -1) ? "dropLeft" : "dropRight";
            this.nextAction();
        } 
        else 
        {
            this.moveRight(this.xSpeed * this.directionMultiplier);
        }
    }
	
	private _isItTimeToSwoop():boolean
	{
		//The width will be the same for both left and right drop anims, 
		//so just getting one of them here.
        const monsterDropLeftAnim = this.animationManager.animations.dropLeft;
		
        const monsterSwoopXCenter = this.x + (monsterDropLeftAnim.width / 2);
        const monsterSwoopYCenter = this.y + (monsterDropLeftAnim.height / 2);
        
        const player = this.playerModel;
        const playerXCenter = player.x + (player.width / 2);
        const playerYCenter = player.y + (player.height / 2);
        
		
        const yDifference = playerYCenter - monsterSwoopYCenter; 
		
		//If the player is to the left of the monster, we'll get a negative value here,
		//so make it positive
        const xDifference = playerXCenter - monsterSwoopXCenter;
        const positiveXDifference = (xDifference >= 0) ? xDifference : -xDifference;
        
        //Monster will switch to swooping down diagnolly, with the same speed for x and y.
        //So, if the xDifference and yDifference match, it's time to swoop, as it's 
		//correctly aimed at the player.
        return (positiveXDifference >= yDifference);
	}
    
	
	
    swoopDown():void
    {
        //Y speed is used for both X and Y movement, so it's diagonal.
        //This is important to make sure the falcon hits the target
        this.moveRight(this.ySpeed * this.directionMultiplier);
        this.moveDown(this.ySpeed);
    }
    
	
	
    swoopUp():void
    {
        if(this.y <= this.startY)
        {
            this.y = this.startY;
            this.state = "flapping";
            this.nextAction();
        } else {
            this.damageDealt = 0; //will be reset at stalking
            
            // We want to be slower rising, so player can see the monster
            // We also want to ensure the angle matches the sprite
            this.moveUp(this.ySpeed * 0.65);
            this.moveRight((this.ySpeed * 0.4) * this.directionMultiplier);
        }
    }
    
	
	
    reposition():void
    {
        const kernel = Kernel.getInstance();
        
        //get player center and monster center; also pre-calculate the real speed of the monster
        const playerCenter = this.playerModel.x + (this.playerModel.width / 2)
        const monsterCenter = this.x + (this.width / 2);
        const preCalculatedMonsterSpeed = UnitHelper.speed(this.xSpeed);
        
        if(this._isFalconCenteredAbovePlayer(playerCenter, monsterCenter, preCalculatedMonsterSpeed))
        {
            this.lastSwoop = kernel.totalLevelActiveMilliseconds;
            this.nextAction();
        } else {
            this._moveFalconToCenterAbovePlayer(playerCenter, monsterCenter);
        }
    }
	
	private _isFalconCenteredAbovePlayer(playerCenter:number, monsterCenter:number, preCalculatedMonsterSpeed:number):boolean
	{
		return ((monsterCenter < playerCenter + preCalculatedMonsterSpeed) && 
					(monsterCenter > playerCenter - preCalculatedMonsterSpeed));
	}
	
	private _moveFalconToCenterAbovePlayer(playerCenter:number, monsterCenter:number):void
	{
		this.directionMultiplier = (playerCenter < monsterCenter) ? -1 : 1;
        this.moveRight(this.xSpeed * this.directionMultiplier);
	}
    
	
	
    //events------------------------------------------------------------
    
    hitPlayerOrGroundEventAction(otherModel:IModel):void
    {
        if(this.state == "dropLeft" || this.state == "dropRight")
        {
            this.state = (this.directionMultiplier == -1) ? "riseLeft" : "riseRight";
            this.nextAction();
        }
    }
}