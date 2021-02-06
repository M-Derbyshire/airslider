class Shocker extends Model
{
    constructor(color, mode, speedX = 0, playerIndex = 0)
    {
        super(Model);
        
        this.color = color;
        this.mode = mode;
        this._state = "shock";
        this._active = false;
        this._xSpeed = speedX; //this will be fed through xSpeed()
        this.homingTargetIndex = playerIndex;
		this.damageDealt = 2;
    }
    
    load(levelLeftEdge, levelRightEdge)
    {
        super.load(levelLeftEdge, levelRightEdge);
        
        let width = (this.color == "purple") ? 300 : 100;
        
        this.animationManager.registerAnimations({
            shock: this.animationManager.createAnimation({
                path: "/assets/models/shocker/anim/" + this.color,
                frameCount: 3,
                fps: 24,
                width: width,
                height: 340,
            })
        });
        
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
        if(this.kernel.level.levelSpeed == 0) //updates zSpeed
        {
            this.zSpeed = -(this.helpers.zCalc.speed(this.kernel.level.initialLevelSpeedRaw, this.kernel.fps) / 1.5);
        } else {
            this.zSpeed = this.kernel.level.levelSpeed / 1.5;
        }
        
        if(this.mode == "home")
        {
            this.zSpeed = (this.zSpeed / 4) * 3;
            this.homingSpeed = 100 / this.xSpeed;
            this.xSpeed = 0;
            
            //sweep towards the player
            this.xSpeed = 
            ((this.kernel.loadedModels[this.homingTargetIndex].x + (this.kernel.loadedModels[this.homingTargetIndex].width / 2)) - 
            (this.x + (this.width / 2))) / this.homingSpeed;
        }
        
        this.z -= this.zSpeed; //not using this.moveOut(), as the levelspeed is being reset based on fps -- thus this is as well
        this.moveRight(this.xSpeed);
        
        if(this.z < 0)
        {
            this.active = false;
        }
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