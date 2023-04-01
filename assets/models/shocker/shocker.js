import ASModel from '/assets/models/ASModel/ASModel';

export default class Shocker extends ASModel
{
	//Possible modes: "static", "sweep", "home"
    constructor(color, mode, playerModel = null, speedX = 0)
    {
        super(ASModel);
        
        this.color = color;
        this.mode = mode;
        this._state = "shock";
        this._active = false;
        this._xSpeed = speedX; //this will be fed through xSpeed()
        this.homingTarget = playerModel;
		this.damageDealt = 2;
		this.homingZStart = 200; //If in "home" mode, at what Z position do we start homing?
    }
    
    load()
    {
        super.load();
		
		let width;
		let frameCoordinates;
		
		if(this.color === "purple")
		{
			width = 300;
			
			frameCoordinates = [
				{ x: 0, y: 0, width: 783, height: 476 },
				{ x: 0, y: 475, width: 783, height: 476 },
				{ x: 0, y: 953, width: 783, height: 476 },
			];
		}
		else
		{
			width = 100;
			
			frameCoordinates = [
				{ x: 0, y: 0, width: 131, height: 238 },
				{ x: 0, y: 239, width: 131, height: 238 },
				{ x: 0, y: 478, width: 131, height: 238 },
			];
		}
        
        this.animationManager.registerAnimations({
            shock: this.animationManager.createAnimation({
                sheetPath: "/assets/models/shocker/anim/shocker-" + this.color + "-spritesheet.png",
                frameCoordinates,
                fps: 24,
                drawWidth: width,
                drawHeight: 340,
            })
        });
    }
    
    prepare()
    {
        super.prepare();
        
        this.setYPositionFromBottom(this.height);
        this.z = this.helpers.zCalc.vPointDepth;
        
        if(this.mode == "sweep")
        {
            //make shocker sweep either left or right
            this.xSpeed = (((Math.floor(Math.random() * 2)) * 2) - 1) * this.xSpeed;
        }
    }
    
    
    act()
    {
        this._setZSpeedBasedOnLevelSpeed();
		
		//not using this.moveOut(), as the levelspeed is being reset based on fps -- thus this is as well
        this.z -= this.zSpeed;
        
        const currentXSpeed = (this.mode == "home") ? this._getHomingMovementXSpeed() : this.xSpeed;
		
        if(this.z < 0)
        {
            this.active = false;
        }
		
		//This may be negative (which would be left movement)
		this.moveRight(currentXSpeed);
    }
	
	_setZSpeedBasedOnLevelSpeed()
	{
		if(!this.kernel.level.levelMoving)
        {
            this.zSpeed = -(this.helpers.zCalc.speed(this.kernel.level.maxLevelSpeedRaw, this.kernel.fps) / 1.5);
        } else {
            this.zSpeed = this.kernel.level.levelSpeed / 1.5;
        }
	}
	
	_getHomingMovementXSpeed()
	{
		if(this.z > this.homingZStart)
		{
			return 0;
		}
		
		const homingSpeed = 100 / this.xSpeed;
		
		const player = this.homingTarget;
		return ((player.x + (player.width / 2)) - (this.x + (this.width / 2))) / homingSpeed;
	}
	
	
    
    zCollisionEventAction(otherModel)
    {
        //This method doesn't need to do anything.
        //However, in order to register the event, this needs to exist
    }
    
    extraEvents()
    {
        //check for leaving the game area
        if((this.x < this._levelLeftEdge) || (this.x + this.width > this._levelRightEdge))
        {
            this.xSpeed = -this.xSpeed;
            this.moveRight(this.xSpeed);
        }
    }
}