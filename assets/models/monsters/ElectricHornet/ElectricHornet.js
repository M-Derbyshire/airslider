import Monster from '/assets/models/Monster/monster';

export default class ElectricHornet extends Monster {
    
    constructor(playerModel)
    {
        super(Monster);
        
        this.playerModel = playerModel;
        
        this.damageDealt = 10;
        this.color = "yellow";
    }
    
    load()
    {
        super.load();
        
        this._assetsToUnload.push("/assets/models/monsters/ElectricHornet/anim/electricHornet_spritesheet.png");
        
        this.animationManager.registerAnimations({
            flapping: this.animationManager.createAnimation({
                sheetPath: "/assets/models/monsters/ElectricHornet/anim/electricHornet_spritesheet.png",
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
    
    prepare()
    {
        super.prepare();
        
        this.actions = [
            this.fly,
            this.drop,
            this.rise
        ];
        
        this.enterXSpeed = 90;
        this.exitXSpeed = 240;
        this.offScreenUnits = 500;
        this.startY = 100;
        this.startX = this._levelRightEdge + this.offScreenUnits;
        this.startZ = this.playerModel.z;
        this.ySpeed = 1250;
        
        // How long till the hornet will drop?
        this.dropWaitOffset = 2000; // 2 seconds
        this.dropWaitRange = 2000;
        this.initialDropWait = 4000;
        
        this.reset();
    }
    
    // Collision boxes --------------------------------------------------------
    getBoundaryBoxes()
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
    
    enter()
    {
        if(this._levelRightEdge < (this.x + this.width))
        {
            this.moveLeft(this.enterXSpeed);
        } else {
            this.entering = false;
            this.nextDrop = this.helpers.time.getTotalMilliseconds() + this.initialDropWait;
        }
    }
    
    exit()
    {
        if(this.y != this.startY)
        {
            //if not at correct height, don't leave yet
            this.rise();
        } else {        
            this.moveLeft(this.exitXSpeed);
            
            if((this.x + this.width) < (this._levelLeftEdge - this.offScreenUnits))
            {
                this._handleMonsterExitingScreen();
            }
        }
    }
    
    _handleMonsterExitingScreen()
	{
		this.exiting = false;
    	this.active = false;
	}
	
	
    
    reset()
    {
        this.nextDrop = -1;
        this.y = this.startY;
        this.x = this.startX;
        this.z = this.startZ;
        this.startXSpeed = -400;
        this.xSpeed = this.startXSpeed;
        this.state = "flapping";
    }
    
    //movement-----------------------------------------------------
    
    fly()
    {
        // Handle collision with level edges
        // (if the model is over an edge, and still moving in that direction)
        if((this.x <= this._levelLeftEdge && this.xSpeed < 0) || 
            ((this.x + this.width) >= this._levelRightEdge && this.xSpeed > 0))
        {
            this.xSpeed = -this.xSpeed;
        }
        
        // Now move
        this.moveRight(this.xSpeed); // Can be a negative number
        
        // Now determine if monster should start to attack
        if(this.nextDrop === -1)
        {
            this.nextDrop = this._getNextDropTime();
        } 
        else if(this.helpers.time.getTotalMilliseconds() >= this.nextDrop)
        {
            this._triggerDrop();
        }
    }
    
    _getNextDropTime()
	{
		return this.helpers.time.getTotalMilliseconds() + 
									this.dropWaitOffset + 
									Math.floor(Math.random() * this.dropWaitRange);
	}
    
    drop()
    {
        this.moveDown(this.ySpeed);
        this.moveRight(this.xSpeed);
    }
    
    rise()
    {
        this.moveUp(this.ySpeed);
        
        if(this.y <= this.startY)
        {
            this.y = this.startY;
            this.xSpeed = this.startXSpeed;
            this.nextAction();
        }
    }
    
    _triggerDrop()
    {
        this.nextDrop = -1;
        
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

    zCollisionEventAction(otherModel)
    {
        if(this.currentAction === 1)
            this.nextAction();
    }
    
    extraEvents()
    {
        // Check for missing the player on swoop
        if(this.currentAction === 1 && (this.y + this.height) > (this.playerModel.y + 100))
        {
            this.nextAction();
        }
    }
}