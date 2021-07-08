import Monster from '/assets/models/Monster/monster';

export default class NeonPidgeon extends Monster {
    constructor(playerModel, otherMonster = false)
    {
        super(Monster);
        
        this.playerModel = playerModel;
        this.specialLevel = otherMonster;
        this.overlapping = false;
        
        this.damageDealt = 10;
        this.color = "none";
    }
    
    load(levelLeftEdge, levelRightEdge)
    {
        super.load(levelLeftEdge, levelRightEdge);
        
        this.animationManager.registerAnimations({
            falling: this.animationManager.createAnimation({
                sheetPath: "/assets/models/monsters/neonPidgeon/anim/neonPidgeon-spritesheet.png",
                fps: 24,
                drawWidth: 250,
                drawHeight: 200,
				framesCoordinates: [
					{ x: 0, y: 0, width: 337, height: 240 },
				],
            }),
            flapping: this.animationManager.createAnimation({
                sheetPath: "/assets/models/monsters/neonPidgeon/anim/neonPidgeon-spritesheet.png",
                fps: 24,
                drawWidth: 250,
                drawHeight: 200,
				framesCoordinates: [
					{ x: 0, y: 242, width: 337, height: 228 },
					{ x: 0, y: 471, width: 337, height: 228 },
					{ x: 0, y: 700, width: 337, height: 228 },
					{ x: 0, y: 929, width: 337, height: 228 },
					{ x: 0, y: 1158, width: 337, height: 228 },
					{ x: 0, y: 1387, width: 337, height: 228 },
					{ x: 0, y: 1616, width: 337, height: 228 },
					{ x: 0, y: 1845, width: 337, height: 228 },
				],
            }),
            rising: this.animationManager.createAnimation({
                sheetPath: "/assets/models/monsters/neonPidgeon/anim/neonPidgeon-spritesheet.png",
                fps: 24,
                drawWidth: 250,
                drawHeight: 200,
				framesCoordinates: [
					{ x: 0, y: 2074, width: 337, height: 240 },
				],
            }),
        });
        
        this.actions = [
            this.moveSideways,
            this.drop,
            this.rise
        ];
        
        this.enterXSpeed = 90;
        this.exitXSpeed = 240;
        this.offScreenUnits = (this.specialLevel) ? 500 : 800;
        this.startY = (this.specialLevel) ? 250 : 150;
        this.startX = this._levelRightEdge + this.offScreenUnits;
        this.startZ = this.playerModel.z;
        this.ySpeed = 1800;
        this.dropWaitOffset = 2000; //5 seconds
        this.dropWaitRange = 2000; //4 seconds
        this.initialDropWait = 8000;
        
        this.reset();
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
            this.state = "rising";
            this.rise();
        } else {
            this.state = "flapping";
        
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
        this.xSpeed = (this.specialLevel) ? -1080 : -960;
        this.state = "flapping";
    }
    
    //movement-----------------------------------------------------
    
    moveSideways()
    {
        this.moveRight(this.xSpeed);
        
        this._handleMonsterOverlappingLevelEdges();
        
        if(this.nextDrop === -1)
        {
            this.nextDrop = this._getNextDropTime();
        } 
		else if(this._monsterShouldDrop())
        {
            this._startMonsterDrop();
        }
        
		//If this should be true, it will be set to true by neonPidgeonOverlappingEventAction, so end on this.
        this.overlapping = false;
    }
	
	_startMonsterDrop()
	{
		this.nextDrop = -1;
        this.state = "falling";
        this.nextAction();
	}
	
	_getNextDropTime()
	{
		return this.helpers.time.getTotalMilliseconds() + 
									this.dropWaitOffset + 
									Math.floor(Math.random() * this.dropWaitRange);
	}
	
	_monsterShouldDrop()
	{
		return ((this.helpers.time.getTotalMilliseconds() >= this.nextDrop) && 
				!this.overlapping && 
            	((this.x + this.width >= this.playerModel.x) && 
				(this.x <= this.playerModel.x + this.playerModel.width)));
	}
	
	_handleMonsterOverlappingLevelEdges()
	{
		if(this.x <= this._levelLeftEdge || this.x + this.width >= this._levelRightEdge)
        {
            this.xSpeed = -this.xSpeed;
            
            this.x = (this.xSpeed > 0) ? 
                (this._levelLeftEdge + 1) :
                ((this._levelRightEdge - this.width) - 1);
        }
	}
	
	
    
    drop()
    {
        this.moveDown(this.ySpeed);
    }
    
    rise()
    {
        this.moveUp(this.ySpeed);
        
        if(this.y <= this.startY)
        {
            this.y = this.startY;
            this.state = "flapping";
            this.nextAction();
        }
    }
    
    //events------------------------------------------------------------
    
    neonPidgeonOverlappingEventAction(otherModel)
    {
        this.overlapping = true;
    }
    
    hitPlayerOrGroundEventAction(otherModel)
    {
        if(((this.y + this.height) > otherModel.y) && 
            (this.y + this.height < this.kernel.unitsWithinCamera))
        {
            //makes sure the player doesn't lose extra health if they collide from the side
            this.y = otherModel.y - this.height - 1;
        }
        
        if(this.state == "falling" )
        {
            this.state = "rising";
            this.nextAction();
        }
    }
}