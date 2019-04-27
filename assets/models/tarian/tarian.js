class Tarian extends Model {
    constructor()
    {
        super(Model);
        
        this.state = "forward";
        this.active = true;
        this.health = 100;
        
        this.exploding = false;
        this.lost = false;
        this.flashSpeed = secondsToFrames(0.5);
        this.lastFlashChange = -this.flashSpeed; //used in the flashing
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
            exploding: this.registerAnim({
                path: kernel.rootPath + "/assets/models/tarian/anim/exploding",
                frameCount: 22,
                fps: 24,
                width: xUnit(120),
                height: yUnit(170),
                nextAnim: "lost",
            }),
            lost: this.registerAnim({
                path: kernel.rootPath + "/assets/models/tarian/anim/lost",
                frameCount: 3,
                fps: 24,
                width: xUnit(120),
                height: yUnit(170),
            }),
        };
        
        this.z = 20;
        this.x = (kernel.graphicEn.gameCan.width / 2) - (this.anims[this.state].width / 2);
        this.y = (kernel.graphicEn.gameCan.height - this.anims[this.state].height);
        this.xSpeedRaw = 1000;
        this.zSpeed = 0; //used on failure
        
        this.registerEvent([
            "Shocker", 
            "NeonPidgeon",
            "LavaBall"
        ], this.zCollisionEvent);
    }
    
    act()
    {
        this.xSpeed = this.xSpeedRaw;
        
        switch(this.state)
        {
            case "right":
                this.x += xSpeed(this.xSpeedRaw);
                break;
            case "left":
                this.x -= xSpeed(this.xSpeedRaw);
                break;
        }
        
        if(this.health <= 10 && this.health > 0)
        {
            this.flash();
        }
        
        //make sure the exploding/lost anims always run when they should
        if(this.exploding && this.state != "exploding")
        {
            if(this.state == "lost")
            {
                this.exploding = false;
                this.lost = true;
            } else {
                this.changeState("exploding");
            }
        }
        
        if(this.lost && this.state != "lost")
        {
            this.changeState("lost");
        }
        
        //this will run if Tarian is onscreen, but defeated
        if(this.state == "lost" && this.z >= 0)
        {
            this.state = "lost";
            this.zSpeed -= zCalc.speed(15);
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
            if(thisModel.state != "exploding" && thisModel.state != "lost")
            {
                kernel.loadedModels[thisModel.loadedIndex].health -= otherModel.damageDealt;
                if(kernel.loadedModels[thisModel.loadedIndex].health <= 0)
                {
                    kernel.loadedModels[thisModel.loadedIndex].health = 0;
                    kernel.loadedModels[thisModel.loadedIndex].exploding = true;
                    kernel.loadedModels[thisModel.loadedIndex].display = true;
                    navigator.vibrate(3000);
                } else {
                    navigator.vibrate(250);
                }
                
                kernel.level.HUD.damageFlash.start(otherModel.color);
                kernel.level.HUD.update = true;
            }
        }
    }
    
    flash()
    {
        if(this.lastFlashChange + this.flashSpeed <= kernel.level.framesPassed)
        {
            this.display = !this.display;
        }
    }
}
