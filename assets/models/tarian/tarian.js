import ASModel from '/assets/models/ASModel/ASModel';

export default class Tarian extends ASModel {
    constructor()
    {
        super(ASModel);
        
        this._state = "forward";
        this._active = true;
        this.health = 100;
        
        this.exploding = false;
        this.lost = false;
        this.lastFlashChange = 0; //used in the flashing
        this.flashSpeed = 50;
        
        this.lastSpeedChange = 0; //used when changing the speed
    }
    
    load()
    {
        super.load();
        
        //I've used exact values for the fps, so it will be consistent when changing game fps
        this.animationManager.registerAnimations({
            forward: this.animationManager.createAnimation({
                sheetPath: "/assets/models/tarian/anim/tarian-spritesheet.png", 
                fps: 24,
                drawWidth: 120,
                drawHeight: 170,
				frameCoordinates: [
					{ x: 0, y: 2760, width: 92, height: 119 },
					{ x: 0, y: 2880, width: 92, height: 119 },
					{ x: 0, y: 3000, width: 92, height: 119 },
					{ x: 0, y: 3120, width: 92, height: 119 },
				]
            }),
            left: this.animationManager.createAnimation({
                sheetPath: "/assets/models/tarian/anim/tarian-spritesheet.png", 
                fps: 24, 
                drawWidth: 170, 
                drawHeight: 170, 
                xOffset: -40,
				frameCoordinates: [
					{ x: 0, y: 3600, width: 126, height: 97 },
					{ x: 0, y: 3698, width: 126, height: 97 },
					{ x: 0, y: 3796, width: 126, height: 97 },
					{ x: 0, y: 3894, width: 126, height: 97 },
				]
            }),
            right: this.animationManager.createAnimation({
                sheetPath: "/assets/models/tarian/anim/tarian-spritesheet.png", 
                fps: 24,
                drawWidth: 170,
                drawHeight: 170,
                xOffset: 40,
				frameCoordinates: [
					{ x: 0, y: 3992, width: 118, height: 97 },
					{ x: 0, y: 4090, width: 118, height: 97 },
					{ x: 0, y: 4188, width: 118, height: 97 },
					{ x: 0, y: 4286, width: 118, height: 97 },
				]
            }),
            exploding: this.animationManager.createAnimation({
                sheetPath: "/assets/models/tarian/anim/tarian-spritesheet.png", 
                fps: 24,
                drawWidth: 120,
                drawHeight: 170,
                nextAnim: "lost",
				frameCoordinates: [
					{ x: 0, y: 0, width: 92, height: 119 },
					{ x: 0, y: 120, width: 92, height: 119 },
					{ x: 0, y: 240, width: 92, height: 119 },
					{ x: 0, y: 360, width: 92, height: 119 },
					{ x: 0, y: 480, width: 92, height: 119 },
					{ x: 0, y: 600, width: 92, height: 119 },
					{ x: 0, y: 720, width: 92, height: 119 },
					{ x: 0, y: 840, width: 92, height: 119 },
					{ x: 0, y: 960, width: 92, height: 119 },
					{ x: 0, y: 1080, width: 92, height: 119 },
					{ x: 0, y: 1200, width: 92, height: 119 },
					{ x: 0, y: 1320, width: 92, height: 119 },
					{ x: 0, y: 1440, width: 92, height: 119 },
					{ x: 0, y: 1560, width: 92, height: 119 },
					{ x: 0, y: 1680, width: 92, height: 119 },
					{ x: 0, y: 1800, width: 92, height: 119 },
					{ x: 0, y: 1920, width: 92, height: 119 },
					{ x: 0, y: 2040, width: 92, height: 119 },
					{ x: 0, y: 2160, width: 92, height: 119 },
					{ x: 0, y: 2280, width: 92, height: 119 },
					{ x: 0, y: 2400, width: 92, height: 119 },
					{ x: 0, y: 2520, width: 92, height: 119 },
					{ x: 0, y: 2640, width: 92, height: 119 },
				]
            }),
            lost: this.animationManager.createAnimation({
                sheetPath: "/assets/models/tarian/anim/tarian-spritesheet.png", 
                fps: 24,
                drawWidth: 120,
                drawHeight: 170,
				frameCoordinates: [
					{ x: 0, y: 3240, width: 92, height: 119 },
					{ x: 0, y: 3360, width: 92, height: 119 },
					{ x: 0, y: 3480, width: 92, height: 119 },
				]
            })
        });
    }
    
    prepare()
    {
        super.prepare();
        
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
		if(this.kernel.totalLevelActiveMilliseconds - this.lastSpeedChange >= 100) //1 tenth of a second
        {
            this.lastSpeedChange = this.kernel.totalLevelActiveMilliseconds;
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
