import Monster from '/assets/models/Monster/monster';

export default class Ghost extends Monster {
    constructor(playerModel)
    {
        super(Monster);
        
        this.playerModel = playerModel;
        
        this.damageDealtOrig = 2;
        this.damageDealt = this.damageDealtOrig;
        this.color = "ghost";
    }
    
    load()
    {
        super.load();
        
        this._assetsToUnload.push("/assets/models/monsters/Ghost/anim/ghost-spritesheet.png");
        
        this.animationManager.registerAnimations({
            normal: this.animationManager.createAnimation({
                sheetPath: "/assets/models/monsters/Ghost/anim/ghost-spritesheet.png",
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
    
    prepare()
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
        this.minXSpeed = 1000;
        this.maxXSpeed = 2000;
        this.zSpeed = 12; // this will be multiplied by 10, as 120 was affecting Tarian's zCollision event
        
        //outLimit is how far back the monster will go, before moving forward
        //inLimit is the point it will start it's sweeping again
        this.outLimit = 1;
        this.inLimit = (this.playerModel.z + 100);
        
        this.reset();
    }
    
    //entering and exiting and reseting-----------------------------------------
    
    enter()
    {
        this.entering = false; //go straight to the sweeping
    }
    
    exit()
    {
        //move
        this.moveIn(this.exitZSpeed);
        
        if(this.z <= 0)
        {
            this.exiting = false;
            this.active = false;
        }
    }
    
    reset()
    {
        this.xSpeed = this.minXSpeed;
        this.y = this.startY;
        this.x = this.startX;
        this.z = this.startZ;
        this.directionMultiplier = 1; //Multiply speed by this; Negate to change direction
    }
    
    //movement-----------------------------------------------------
    
    getNewSpeed() //again, not an action
    {
        return this.minXSpeed + (Math.random() * (this.maxXSpeed - this.minXSpeed));
    }
    
    sweep()
    {
        this._handleMonsterOverlappingLevelEdges();
		
        this.moveRight(this.xSpeed * this.directionMultiplier);
        
        this.moveOut(this.zSpeed * 10);
        
        if(this.z <= this.outLimit)
        {
            this._handleMonsterReachingOutLimit();
        }
    }
	
	_handleMonsterOverlappingLevelEdges()
	{
		if(this.x < this._levelLeftEdge)
        {
            this.x = this._levelLeftEdge;
            this.directionMultiplier = 1;
        } else if (this.x + this.width > this._levelRightEdge)
        {
            this.x = this._levelRightEdge - this.width;
            this.directionMultiplier = -1;
        }
	}
	
	_handleMonsterReachingOutLimit()
	{
		this.z = this.outLimit;
        this.nextAction();
	}
	
	
    
    moveUp()
    {
        this.moveIn(this.zSpeed * 10);
        
        if(this.z >= this.inLimit)
        {
            this._handleMonsterReachingInLimit();
        }
    }
	
	_handleMonsterReachingInLimit()
	{
		this.xSpeed = this.getNewSpeed();
		this.z = this.inLimit;
		this.damageDealt = this.damageDealtOrig;
		this.nextAction();
	}
    
    
    //events------------------------------------------------------------
    
    zCollisionEventAction(otherModel)
    {
        if(this.currentAction == 0 && !this.exiting) //the index number of the current action method in the array in Monster class
        {
            this.z = otherModel.z + this.zSpeed + 1;
            this.damageDealt = 0; //in case it's still colliding (will be reset when it gets to the inLimit)
            this.nextAction();
        }
    }
}