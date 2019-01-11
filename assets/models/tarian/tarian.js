class Tarian extends Model {
    constructor()
    {
        super(Model);
        
        this.state = "forward";
        this.active = true;
        this.health = 100;
        
        this.lost = false;
    }
    
    load()
    {
        //I've used exact values for the fps, so it will be consistent when changing game fps
        this.anims = {
            forward: this.registerAnim({
                path: kernel.rootPath + "/assets/models/tarian/anim/forward", 
                frameCount: 4,
                fps: 24,
                width: xUnit(120),
                height: yUnit(170),
            }),
            left: this.registerAnim({
                path: kernel.rootPath + "/assets/models/tarian/anim/left", 
                frameCount: 4, 
                fps: 24, 
                width: xUnit(170), 
                height: yUnit(170), 
                xOffset: -xUnit(40),
            }),
            right: this.registerAnim({
                path: kernel.rootPath + "/assets/models/tarian/anim/right", 
                frameCount: 4,
                fps: 24,
                width: xUnit(170),
                height: yUnit(170),
                xOffset: xUnit(40),
            }),
            explode: this.registerAnim({
                path: kernel.rootPath + "/assets/models/tarian/anim/forward",
                frameCount: 4,
                fps: 24,
                width: xUnit(120),
                height: yUnit(170),
            }),
            lost: this.registerAnim({
                path: kernel.rootPath + "/assets/models/tarian/anim/forward",
                frameCount: 4,
                fps: 24,
                width: xUnit(120),
                height: yUnit(170),
            }),
        };
        
        this.z = 10;
        this.x = (kernel.graphicEn.gameCan.width / 2) - (this.anims[this.state].width / 2);
        this.y = (kernel.graphicEn.gameCan.height - this.anims[this.state].height);
        this.xSpeed = xSpeed(1000);
        this.zSpeed = 0; //used on failure
        
        this.registerEvent(["Shocker"], this.zCollisionEvent);
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
        
        if(this.lost && (this.state != "lost" || this.state != "explode")) //also check for exploding anim
        {
            this.state = "lost";
        }
        
        //this will run if Tarian is onscreen, but defeated
        if(this.state == "lost" && this.z >= 0)
        {
            this.zSpeed--;
            this.z += this.zSpeed;
        }
        
        //if Tarian is offscreen after loss
        if(this.z <= 0)
        {
            this.active = false;
            kernel.level.levelStop();
        }
    }
    
    extraEvents()
    {
        //check for leaving the game area
        if(this.x < kernel.level.leftEdge)
        {
            this.x = kernel.level.leftEdge;
            this.changeState("forward");
        }
        if(this.x + this.anims[this.state].width > kernel.level.rightEdge)
        {
            this.x = kernel.level.rightEdge - this.anims["forward"].width;
            this.changeState("forward");
        }
    }
    
    zCollisionEvent(thisModel, otherModel)
    {
        if (((thisModel.z >= (otherModel.z - otherModel.zSpeed)) && (thisModel.z <= otherModel.z)) &&
        (thisModel.x + thisModel.anims[thisModel.state].width >= otherModel.x) &&
        (thisModel.x <= otherModel.x + otherModel.anims[otherModel.state].width) &&
        (thisModel.y + thisModel.anims[thisModel.state].height >= otherModel.y) &&
        (thisModel.y <= otherModel.y + otherModel.anims[otherModel.state].height))
        {
            kernel.loadedModels[thisModel.loadedIndex].health -= otherModel.damageDealt;
            if(kernel.loadedModels[thisModel.loadedIndex].health <= 0)
            {
                kernel.loadedModels[thisModel.loadedIndex].health = 0;
                kernel.loadedModels[thisModel.loadedIndex].lost = true;
            }
            kernel.level.HUD.update = true;
        }
    }
}