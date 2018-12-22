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
        this.zSpeed = ySpeed(1000);
        this.z = zCalc.vPointDepth;
    }
    
    act()
    {
        this.z -= this.zSpeed;
        
        
        if(this.z < 0)
        {
            this.active = false;
        }
    }
}