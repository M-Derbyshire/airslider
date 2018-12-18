class Tarian extends Model {
    constructor()
    {
        super(Model);
        
        this.state = "forward";
        this.active = true;
    }
    
    load()
    {
        //I've used exact values for the fps, so it will be consistent when changing game fps
        this.anims = {
            forward: this.registerAnim(kernel.rootPath + "/assets/models/tarian/anim/forward", 4, 24, xUnit(120), yUnit(170)),
            left: this.registerAnim(kernel.rootPath + "/assets/models/tarian/anim/left", 4, 24, xUnit(170), yUnit(170), -xUnit(40)),
            right: this.registerAnim(kernel.rootPath + "/assets/models/tarian/anim/right", 4, 24, xUnit(170), yUnit(170), xUnit(40))
        };
        
        this.z = 50;
        this.x = (kernel.graphicEn.gameCan.width / 2) - (this.anims[this.state].width / 2);
        this.y = (kernel.graphicEn.gameCan.height - this.anims[this.state].height);
        this.xSpeed = xSpeed(1000);
        
        this.registerEvent(["MrStickyStick"], this.zCollisionEvent);
    }
    
    act()
    {
        switch(this.state)
        {
            case "right":
                this.x += this.xSpeed;
                break;
            case "left":
                this.x -= this.xSpeed;
                break;
        }
    }
    
    extraEvents()
    {
        let barrierGap = 0;
        
        //check for leaving the game area
        if(this.x < barrierGap)
        {
            this.x = barrierGap;
            this.state = "forward";
        }
        if(this.x + this.anims[this.state].width > kernel.graphicEn.gameCan.width - barrierGap)
        {
            this.x = kernel.graphicEn.gameCan.width - this.anims["forward"].width - barrierGap;
            this.state = "forward";
        }
    }
    
    zCollisionEvent(thisModel, otherModel)
    {
        if ((thisModel.z == otherModel.z) &&
        (thisModel.x + thisModel.anims[thisModel.state].width >= otherModel.x) &&
        (thisModel.x <= otherModel.x + otherModel.anims[otherModel.state].width) &&
        (thisModel.y + thisModel.anims[thisModel.state].height >= otherModel.y) &&
        (thisModel.y <= otherModel.y + otherModel.anims[otherModel.state].height))
        {
            console.log("zCollision");
        }
    }
}