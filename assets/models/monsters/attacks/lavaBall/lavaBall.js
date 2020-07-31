class LavaBall extends Model {
    constructor()
    {
        super(Model);
        
        this.active = false;
        this.damageDealt = 2;
        this.color = "fire";
        this.zSpeed = 1; //value required for Tarian to recognise hit
    }
    
    load()
    {
        super.load();
        
        let ballWidth = 30;
        let ballHeight = 40;
        
        this.animationManager.registerAnimations({
            drop: this.animationManager.createAnimation({
                path: "/assets/models/monsters/attacks/lavaBall/anim/drop",
                frameCount: 1,
                fps: 24,
                width: ballWidth,
                height: ballHeight
            }),
            break: this.animationManager.createAnimation({
                path: "/assets/models/monsters/attacks/lavaBall/anim/break",
                frameCount: 4,
                fps: 24,
                width: ballWidth,
                height: ballHeight,
                nextAnim: "none"
            }),
            none: this.animationManager.createAnimation({
                path: "/assets/models/monsters/attacks/lavaBall/anim/drop",
                frameCount: 1,
                fps: 24,
                width: 0,
                height: 0
            }),
        });
        
        this.state = "drop";
        
        this.ySpeed = 2160;
    }
    
    act()
    {
        if(this.state == "drop")
        {
            this.moveDown(this.ySpeed);
        }
        
        if(this.y + this.height >= this.kernel.helpers.unit.unitsWithinCamera && this.state == "drop")
        {
            this.setYPositionFromBottom(this.height);
            this.state = "break";
        }
        
        if(this.state == "none")
        {
            this.active = false;
        }
    }
    
    hitPlayerEventAction(otherModel)
    {
        if(this.state == "drop")
        {
            this.state = "break";
        }
    }
}