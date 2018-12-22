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
        
        this.z = 10;
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
        //check for leaving the game area
        if(this.x < kernel.level.leftEdge)
        {
            this.x = kernel.level.leftEdge;
            this.state = "forward";
        }
        if(this.x + this.anims[this.state].width > kernel.level.rightEdge)
        {
            this.x = kernel.level.rightEdge - this.anims["forward"].width;
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