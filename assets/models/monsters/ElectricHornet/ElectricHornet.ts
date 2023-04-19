import IBoundaryBox from '../../Model/IBoundaryBox';
import IModel from '../../Model/IModel';
import Monster from '../../Monster/Monster';
import Tarian from '../../Tarian/Tarian';

/**
 * The Electric Hornet monster
 */
export default class ElectricHornet extends Monster {
    
    private _dropWaitOffset:number;
    private _dropWaitRange:number;
    private _initialDropWait:number;
    
    private _startXSpeed:number;
    
    private _nextDropTime:number;
    
    /**
     * Constructor
     * @param playerModel The model of the player
     */
    constructor(playerModel:Tarian)
    {
        super();
        
        this.playerModel = playerModel;
        
        this.damageDealt = 10;
        this.color = "yellow";
    }
    
    load():void
    {
        super.load();
        
        const spritesheetPath = "/assets/models/monsters/ElectricHornet/anim/electricHornet_spritesheet.png";
        this.assetsToUnload.push(spritesheetPath);
        
        this.animationManager.registerAnimations({
            flapping: this.animationManager.createAnimation({
                sheetPath: spritesheetPath,
                fps: 16,
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
        
        this.actions = [
            this._fly,
            this._drop,
            this._rise
        ];
        
        this.enterXSpeed = 90;
        this.exitXSpeed = 240;
        this.offScreenUnits = 500;
        this.startY = 100;
        this.startX = this.levelRightEdge + this.offScreenUnits;
        this.startZ = this.playerModel.z;
        this.ySpeed = 1250;
        
        // How long till the hornet will drop?
        this._dropWaitOffset = 2000; // 2 seconds
        this._dropWaitRange = 2000;
        this._initialDropWait = 4000;
        
        this.reset();
    }
    
    // Collision boxes --------------------------------------------------------
    getBoundaryBoxes():IBoundaryBox[]
    {
        if(this.currentAction !== 0)
        {
            return [
                {
                    x: this.x + (this.width / 2.7),
                    y: this.y + (this.height / 1.4),
                    z: this.z,
                    width: this.width / 3.7,
                    height: this.height / 3.8
                }
            ];
        }
        
        return [];
    }
    
    //entering and exiting and reseting-----------------------------------------
    
    enter():void
    {
        if(this.levelRightEdge < (this.x + this.width))
        {
            this.moveLeft(this.enterXSpeed);
        } else {
            this.entering = false;
            this._nextDropTime = this.helpers.time.getTotalMilliseconds() + this._initialDropWait;
        }
    }
    
    exit():void
    {
        if(this.y != this.startY)
        {
            //if not at correct height, don't leave yet
            this._rise();
        } else {        
            this.moveLeft(this.exitXSpeed);
            
            if((this.x + this.width) < (this.levelLeftEdge - this.offScreenUnits))
            {
                this._handleMonsterExitingScreen();
            }
        }
    }
    
    private _handleMonsterExitingScreen():void
	{
		this.exiting = false;
    	this.active = false;
	}
	
	
    
    reset():void
    {
        this._nextDropTime = -1;
        this.y = this.startY;
        this.x = this.startX;
        this.z = this.startZ;
        this._startXSpeed = -400;
        this.xSpeed = this._startXSpeed;
        this.state = "flapping";
    }
    
    //movement-----------------------------------------------------
    
    private _fly():void
    {
        // Handle collision with level edges
        // (if the model is over an edge, and still moving in that direction)
        if((this.x <= this.levelLeftEdge && this.xSpeed < 0) || 
            ((this.x + this.width) >= this.levelRightEdge && this.xSpeed > 0))
        {
            this.xSpeed = -this.xSpeed;
        }
        
        // Now move
        this.moveRight(this.xSpeed); // Can be a negative number
        
        // Now determine if monster should start to attack
        if(this._nextDropTime === -1)
        {
            this._nextDropTime = this._getNextDropTime();
        } 
        else if(this.helpers.time.getTotalMilliseconds() >= this._nextDropTime)
        {
            this._triggerDrop();
        }
    }
    
    private _getNextDropTime():number
	{
		return this.helpers.time.getTotalMilliseconds() + 
									this._dropWaitOffset + 
									Math.floor(Math.random() * this._dropWaitRange);
	}
    
    private _drop():void
    {
        this.moveDown(this.ySpeed);
        this.moveRight(this.xSpeed);
    }
    
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
    
    private _triggerDrop()
    {
        this._nextDropTime = -1;
        
        // We need to calculate the x/y speed needed to get to the player (can be negative values)
        const distanceToPlayerTop = this.playerModel.y - (this.y + this.height);
        const playerXCenter = (this.playerModel.width / 2) + this.playerModel.x;
        const thisXCenter = (this.width / 2) + this.x;
        const distanceToPlayerXCentre = playerXCenter - thisXCenter;
        
        const speedMultiplier = 2.75;
        
        this.xSpeed = distanceToPlayerXCentre * speedMultiplier;
        this.ySpeed = distanceToPlayerTop * speedMultiplier;
        
        this.nextAction();
    }
    
    
    // events------------------------------------------------------

    zCollisionEventAction(otherModel:IModel):void
    {
        if(this.currentAction === 1)
            this.nextAction();
    }
    
    extraEvents():void
    {
        // Check for missing the player on swoop
        if(this.currentAction === 1 && (this.y + this.height) > (this.playerModel.y + 100))
        {
            this.nextAction();
        }
    }
}