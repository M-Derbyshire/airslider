import Model from '/assets/models/Model/Model';

export default class Tarian extends Model {
    constructor()
    {
        super(Model);
        
        this._state = "forward";
        this._active = true;
        this.health = 100;
        
        this.exploding = false;
        this.lost = false;
        this.lastFlashChange = 0; //used in the flashing
        this.flashSpeed = 50;
        
        this.lastSpeedChange = 0; //used when changing the speed
    }
    
    load(levelLeftEdge, levelRightEdge)
    {
        super.load(levelLeftEdge, levelRightEdge);
        
        //I've used exact values for the fps, so it will be consistent when changing game fps
        this.animationManager.registerAnimations({
            forward: this.animationManager.createAnimation({
                path: "/assets/models/tarian/anim/forward", 
                frameCount: 4,
                fps: 24,
                width: 120,
                height: 170,
            }),
            left: this.animationManager.createAnimation({
                path: "/assets/models/tarian/anim/left", 
                frameCount: 4, 
                fps: 24, 
                width: 170, 
                height: 170, 
                xOffset: -40,
            }),
            right: this.animationManager.createAnimation({
                path: "/assets/models/tarian/anim/right", 
                frameCount: 4,
                fps: 24,
                width: 170,
                height: 170,
                xOffset: 40,
            }),
            exploding: this.animationManager.createAnimation({
                path: "/assets/models/tarian/anim/exploding",
                frameCount: 22,
                fps: 24,
                width: 120,
                height: 170,
                nextAnim: "lost",
            }),
            lost: this.animationManager.createAnimation({
                path: "/assets/models/tarian/anim/lost",
                frameCount: 3,
                fps: 24,
                width: 120,
                height: 170,
            })
        });
        
        this.z = 20;
        this.centerXPosition();
        this.setYPositionFromBottom(this.height);
        
        this.accl = 800;
        this.deaccl = 100;
        this.topSpeed = 1000;
        this.xSpeed = 0;
        
        this.zSpeed = 35; //used when state is "lost"
    }
	
	
    
    act()
    {
        this._movePlayer();
        
        this._handleDamageFlash();
        
		this._handleExplodingAndLoss();
    }
	
	_handleDamageFlash()
	{
		if(this.health <= 10 && this.health > 0)
        {
            this.flash();
        }
	}
	
	_handleExplodingAndLoss()
	{
		if(this.exploding && this.state != "exploding")
        {
            if(this.state == "lost")
            {
                this.exploding = false;
                this.lost = true;
            } else {
                this.state = "exploding";
            }
        }
        
        if(this.lost && this.state != "lost")
        {
            this.state = "lost";
        }
		
		this._handleOnScreenAfterLoss();
		this._handleLeavingScreenAfterLoss();
	}
	
	_handleOnScreenAfterLoss()
	{
        if(this.lost && this.z >= 0)
        {
            this.moveOut(this.zSpeed);
        }
	}
	
	_handleLeavingScreenAfterLoss()
	{
		if(this.lost && this.z < 0)
        {
            this.active = false;
            this.kernel.level.levelStop();
        }
	}
    
	
	
    _movePlayer() //this will just use moveRight(), but can also feed in negative numbers
    {
        this._setSpeedBasedOnAcceleration();
        
        this.moveRight(this.xSpeed);
    }
	
	_setSpeedBasedOnAcceleration()
	{
		if(this.kernel.totalActiveMilliseconds - this.lastSpeedChange >= 100) //1 tenth of a second
        {
            this.lastSpeedChange = this.kernel.totalActiveMilliseconds;
			this._changeSpeed();
        }
	}
	
	_changeSpeed()
	{
		let directionMultiplier = 0;
		let speedChange = this.accl;
		
		if(this.state == "right")
		{
			directionMultiplier = 1;
		} 
		else if (this.state == "left")
		{
			directionMultiplier = -1;
		} 
		else if (this.state !== "left" && this.state !== "right") //if stopping
		{
			if(this.xSpeed > 0)
			{
				directionMultiplier = -1;
			} 
			else if (this.xSpeed < 0)
			{
				directionMultiplier = 1;
			}
			
			speedChange = this.deaccl;
		}
		
		speedChange *= directionMultiplier;
		this.xSpeed += speedChange;
		
		this._handleTooFastOrNegativeSpeed(speedChange, directionMultiplier);
	}
	
	_handleTooFastOrNegativeSpeed(speedChange, directionMultiplier)
	{
		if(this._isAboveTopSpeedEitherDirection())
		{
			this.xSpeed = this.topSpeed * directionMultiplier;
		} 
		else if (this._isReadyToStopMovement(speedChange))
		{
			this.xSpeed = 0;
		}
	}
	
	_isAboveTopSpeedEitherDirection()
	{
		return (this.xSpeed > this.topSpeed || this.xSpeed < -this.topSpeed);
	}
	
	_isReadyToStopMovement(speedChange)
	{
		return ((this.state !== "left" && this.state !== "right") && 
					(this.xSpeed > -speedChange && this.xSpeed < speedChange));
	}
	
	
	
	
	
    
    extraEvents()
    {
        //check for leaving the game area
        if(this.x < this._levelLeftEdge)
        {
            if(this.state == "left")
            {
                this.state = "forward";
            }
            
            this.x = this._levelLeftEdge;
            this.xSpeed = 0;
        }
        if(this.x + this.width > this._levelRightEdge)
        {
            if(this.state == "right")
            {
                this.state = "forward";
            }
            
            this.x = this._levelRightEdge - this.width;
            this.xSpeed = 0;
        }
    }
    
    zCollisionEventAction(otherModel)
    {
        if("damageDealt" in otherModel && otherModel.damageDealt > 0 && this.state != "exploding" && this.state != "lost")
        {
            this.health -= otherModel.damageDealt;
            if(this.health <= 0)
            {
                this.health = 0;
                this.exploding = true;
                this.display = true;
            }
            
            this.kernel.level.HUD.startDamageFlash(otherModel.color);
        }
    }
	
	zCollisionElectricMineEventAction(otherModel)
    {
        if("damageDealt" in otherModel && otherModel.damageDealt > 0 && otherModel.state === "undetonated")
        {
            this.health -= otherModel.damageDealt;
            if(this.health <= 0)
            {
                this.health = 0;
                this.exploding = true;
                this.display = true;
            }
            
            this.kernel.level.HUD.startDamageFlash(otherModel.color);
        }
		
		//Change movement direction to simulate the blast (or just a bounce off if already denotated)
		if("blastSpeed" in otherModel)
		{
			const collisionSpeed = (otherModel.state === "undetonated") ? 
				otherModel.blastSpeed :
				otherModel.blastSpeed / 4;
				
			this.xSpeed = (this.xSpeed > 0) ? -collisionSpeed : collisionSpeed;
			this.state = "forward"; //If we don't change this, we still accelerate in the direction we were moving
			
			this.x = (this.x + this.width <= otherModel.x + otherModel.width) ?
				(otherModel.x - this.width) - 2 :
				(otherModel.x + otherModel.width) + 2;
			
		}
    }
    
    flash()
    {
        if(this.lastFlashChange == 0 || this.lastFlashChange + this.flashSpeed < this.helpers.time.getTotalMilliseconds())
        {
            this.display = !this.display;
            this.lastFlashChange = this.helpers.time.getTotalMilliseconds();
        }
    }
}
