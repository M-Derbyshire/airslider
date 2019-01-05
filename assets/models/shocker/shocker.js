class Shocker extends Model
{
    constructor(color, mode, speedX, playerIndex = 0)
    {
        super(Model);
        
        
        this.color = color;
        this.mode = mode;
        this.state = "shock";
        this.active = false;
        this.xSpeed = speedX; //this will be fed through xSpeed() in load()
        this.homingTargetIndex = playerIndex;
    }
    
    load()
    {
        this.anims = {
            shock: this.registerAnim(kernel.rootPath + "/assets/models/shocker/anim/" + this.color, 3, 24, xUnit(100), yUnit(340))
        };
        
        this.y = (kernel.graphicEn.gameCan.height - this.anims[this.state].height);
        this.z = zCalc.vPointDepth;
        
        this.zSpeed = kernel.level.levelSpeed / 2;
        
        switch(this.mode)
        {
            case "static":
                this.xSpeed = 0;
                break;
            case "sweep":
                //make shocker sweep either left or right
                this.xSpeed = (((Math.floor(Math.random() * 2)) * 2) - 1) * xSpeed(this.xSpeed);
                break;
            case "home":
                this.zSpeed = (this.zSpeed / 4) * 3;
                this.homingSpeed = 100 / this.xSpeed;
                this.xSpeed = 0;
                break;
        }
    }
    
    act()
    {
        if(this.mode == "home")
        {
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
            this.xSpeed = -(this.xSpeed);
            this.x += this.xSpeed;
        }
    }
}