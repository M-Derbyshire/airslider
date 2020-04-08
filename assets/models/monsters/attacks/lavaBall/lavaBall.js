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
        let x = 30; //fed into xUnit and yUnit when setting up anims
        let y = 40;
        
        this.animationManager.registerAnimations({
            drop: this.animationManager.createAnimation({
                path: "/assets/models/monsters/attacks/lavaBall/anim/drop",
                frameCount: 1,
                fps: 24,
                width: xUnit(x),
                height: yUnit(y)
            }),
            break: this.animationManager.createAnimation({
                path: "/assets/models/monsters/attacks/lavaBall/anim/break",
                frameCount: 4,
                fps: 24,
                width: xUnit(x),
                height: yUnit(y),
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
        this.registerEvent(["Tarian"], this.hitPlayerEvent);
        
        this.ySpeed = 2160;
    }
    
    act()
    {
        if(this.state == "drop")
        {
            this.moveDown(this.ySpeed);
        }
        
        if(this.y + this.height >= kernel.graphicEn.gameCan.height && this.state == "drop")
        {
            this.y = kernel.graphicEn.gameCan.height - this.height;
            this.state = "break";
        }
        
        if(this.state == "none")
        {
            this.active = false;
        }
    }
    
    hitPlayerEvent(thisModel, otherModel)
    {
        if(((thisModel.x + thisModel.width >= otherModel.x) &&
        (thisModel.x <= otherModel.x + otherModel.width) &&
        (thisModel.y + thisModel.height >= otherModel.y) &&
        (thisModel.y <= otherModel.y + otherModel.height)) && 
        thisModel.z == otherModel.z &&
        thisModel.state == "drop")
        {
            kernel.loadedModels[thisModel.loadedIndex].state = "break";
        }
    }
}