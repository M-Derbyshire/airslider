class Shocker extends Model
{
    constructor(color, mode)
    {
        super(Model);
        
        this.color = color;
        this.mode = mode;
        this.state = "shock";
        this.active = false;
    }
    
    load()
    {
        this.anims = {
            shock: this.registerAnim(kernel.rootPath + "/assets/models/shocker/anim/" + this.color, 3, 24, xUnit(100), yUnit(340))
        };
        
        this.y = (kernel.graphicEn.gameCan.height - this.anims[this.state].height);
        this.z = zCalc.vPointDepth;
        
        this.zSpeed = zCalc.speed(400);
        switch(this.mode)
        {
            case "static":
                this.xSpeed = 0;
                break;
            case "sweep":
                //make shocker sweep either left or right
                this.xSpeed = (((Math.floor(Math.random() * 2)) * 2) - 1) * xSpeed(1000);
                break;
        }
    }
    
    act()
    {
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