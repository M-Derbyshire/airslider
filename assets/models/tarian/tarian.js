class Tarian extends Model {
    constructor()
    {
        super(Model);
        
        this.state = "forward";
        this.active = true;
    }
    
    load()
    {
        this.anims = {
            forward: this.registerAnim(kernel.rootPath + "/assets/models/tarian/anim/forward", 4, kernel.fps, xUnit(120), yUnit(170)),
            left: this.registerAnim(kernel.rootPath + "/assets/models/tarian/anim/left", 4, kernel.fps, xUnit(170), yUnit(170), -xUnit(40)),
            right: this.registerAnim(kernel.rootPath + "/assets/models/tarian/anim/right", 4, kernel.fps, xUnit(170), yUnit(170), xUnit(40))
        };
        
        this.z = zUnit(15);
        this.x = (kernel.graphicEn.gameCan.width / 2) - (this.anims[this.state].width / 2);
        this.y = (kernel.graphicEn.gameCan.height - this.anims[this.state].height) + this.z;
        this.xSpeed = xUnit(40);
        
        this.registerEvent(["MrStickyStick"], this.zCollisionEvent);
    }
    
    move()
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
        //check for leaving the game area
        if(this.x < 0)
        {
            this.x = 0;
            this.state = "forward";
        }
        if(this.x + this.anims[this.state].width > kernel.graphicEn.gameCan.width)
        {
            this.x = kernel.graphicEn.gameCan.width - this.anims["forward"].width;
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