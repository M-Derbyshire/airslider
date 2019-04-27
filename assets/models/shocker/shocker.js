class Shocker extends Model
{
    constructor(color, mode, speedX, playerIndex = 0)
    {
        super(Model);
        
        
        this.color = color;
        this.mode = mode;
        this.state = "shock";
        this.active = false;
        this.xSpeedRaw = speedX; //this will be fed through xSpeed() in load()
        this.homingTargetIndex = playerIndex;
        
        //set the damage this shocker will deal
        switch(this.color)
        {
            case "yellow":
                this.damageDealt = 2;
                break;
            case "orange":
                this.damageDealt = 5;
                break;
            case "red":
                this.damageDealt = 10;
                break;
        }
    }
    
    load()
    {
        this.anims = {
            shock: this.registerAnim({
                path: kernel.rootPath + "/assets/models/shocker/anim/" + this.color,
                frameCount: 3,
                fps: 24,
                width: xUnit(100),
                height: yUnit(340),
            })
        };
        
        this.y = (kernel.graphicEn.gameCan.height - this.anims[this.state].height);
        this.z = zCalc.vPointDepth;
        
        if(this.mode = "static")
        {
            this.xSpeed = 0;
        }
        
        if(this.mode == "sweep")
        {
            //make shocker sweep either left or right
            this.xSpeed = (((Math.floor(Math.random() * 2)) * 2) - 1) * xSpeed(this.xSpeedRaw);
        }
    }
    
    act()
    {
        this.zSpeed = kernel.level.levelSpeed / 2; //updates zSpeed
        
        if(this.mode == "home")
        {
            this.zSpeed = (this.zSpeed / 4) * 3;
            this.homingSpeed = 100 / xSpeed(this.xSpeedRaw);
            this.xSpeed = 0;
            
            //sweep towards the player
            this.xSpeed = 
            xSpeed(((kernel.loadedModels[this.homingTargetIndex].x + (kernel.loadedModels[this.homingTargetIndex].anims[kernel.loadedModels[this.homingTargetIndex].state].width / 2)) - 
            (this.x + (this.anims[this.state].width / 2))) / this.homingSpeed);
        }
        
        this.z -= this.zSpeed;
        this.x += this.xSpeed;
        
        if(this.z < 0)
        {
            this.active = false;
        }
    }
    
    extraEvents()
    {
        //check for leaving the game area
        if((this.x < kernel.level.leftEdge) || (this.x + this.anims[this.state].width > kernel.level.rightEdge))
        {
            this.xSpeed = -xSpeed(this.xSpeedRaw);
            this.x += this.xSpeed;
        }
    }
    
    levelStopped()
    {
        this.zSpeed = -this.zSpeed;
    }
}