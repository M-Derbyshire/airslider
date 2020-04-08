class Tarian extends Model {
    constructor()
    {
        super(Model);
        
        this._state = "forward";
        this._active = true;
        this.health = 100;
        
        this.exploding = false;
        this.lost = false;
        this.lastFlashChange = 0; //used in the flashing
        this.flashSpeed = 50;
        
        this.lastSpeedChange = 0; //used when changing the speed
    }
    
    load()
    {
        //I've used exact values for the fps, so it will be consistent when changing game fps
        this.animationManager.registerAnimations({
            forward: this.animationManager.createAnimation({
                path: "/assets/models/tarian/anim/forward", 
                frameCount: 4,
                fps: 24,
                width: xUnit(120),
                height: yUnit(170),
            }),
            left: this.animationManager.createAnimation({
                path: "/assets/models/tarian/anim/left", 
                frameCount: 4, 
                fps: 24, 
                width: xUnit(170), 
                height: yUnit(170), 
                xOffset: -xUnit(40),
            }),
            right: this.animationManager.createAnimation({
                path: "/assets/models/tarian/anim/right", 
                frameCount: 4,
                fps: 24,
                width: xUnit(170),
                height: yUnit(170),
                xOffset: xUnit(40),
            }),
            exploding: this.animationManager.createAnimation({
                path: "/assets/models/tarian/anim/exploding",
                frameCount: 22,
                fps: 24,
                width: xUnit(120),
                height: yUnit(170),
                nextAnim: "lost",
            }),
            lost: this.animationManager.createAnimation({
                path: "/assets/models/tarian/anim/lost",
                frameCount: 3,
                fps: 24,
                width: xUnit(120),
                height: yUnit(170),
            })
        });
        
        this.z = 20;
        this.x = (kernel.graphicEn.gameCan.width / 2) - (this.width / 2);
        this.y = (kernel.graphicEn.gameCan.height - this.height);
        
        this.accl = 800; // applied every tenth of a second
        this.deaccl = 100; // applied every tenth of a second
        this.topSpeed = 1000;
        this.xSpeed = 0;
        
        this.zSpeed = 35; //used on failure
        
        this.registerEvent([
            "Shocker", 
            "NeonPidgeon",
            "LavaBall",
            "Falcon",
            "Werewolf"
        ], this.zCollisionEvent);
    }
    
    act()
    {
        this.movePlayer();
        
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
                this.state = "exploding";
            }
        }
        
        if(this.lost && this.state != "lost")
        {
            this.state = "lost";
        }
        
        //this will run if Tarian is onscreen, but defeated
        if(this.state == "lost" && this.z >= 0)
        {
            this.state = "lost";
            this.moveOut(this.zSpeed);
        }
        
        //if Tarian is offscreen after loss
        if(this.z <= 0)
        {
            this.active = false;
            kernel.level.levelStop();
        }
    }
    
    movePlayer() //this will just use moveRight(), but can also feed in negative numbers
    {
        if(kernel.totalActiveMilliseconds - this.lastSpeedChange >= 100) //1 tenth of a second
        {
            this.lastSpeedChange = kernel.totalActiveMilliseconds;
            
            let direction = 0;
            let speedChange = this.accl;
            
            // speed will be multiplied by the direction, to decide left or right
            if(this.state == "right")
            {
                direction = 1;
            } else if (this.state == "left")
            {
                direction = -1;
            } else if (this.state !== "left" && this.state !== "right") //if stopping
            {
                if(this.xSpeed > 0)
                {
                    direction = -1;
                } else if (this.xSpeed < 0)
                {
                    direction = 1;
                }
                
                speedChange = this.deaccl;
            }
            
            //set the speed
            speedChange *= direction;
            this.xSpeed += speedChange;
            
            // finally, if gone above topspeed, set to topspeed
            // else, if reached zero, set to zero
            if(this.xSpeed > this.topSpeed || this.xSpeed < -this.topSpeed)
            {
                this.xSpeed = this.topSpeed * direction;
            } 
            else if (
                        (this.state !== "left" && this.state !== "right") && 
                        (this.xSpeed > -speedChange && this.xSpeed < speedChange)
                    )
            {
                this.xSpeed = 0;
            }
        }
        
        this.moveRight(this.xSpeed);
    }
    
    extraEvents()
    {
        //check for leaving the game area
        if(this.x < kernel.level.leftEdge)
        {
            if(this.state == "left")
            {
                this.state = "forward";
            }
            
            this.x = kernel.level.leftEdge;
            this.xSpeed = 0;
        }
        if(this.x + this.width > kernel.level.rightEdge)
        {
            if(this.state == "right")
            {
                this.state = "forward";
            }
            
            this.x = kernel.level.rightEdge - this.width;
            this.xSpeed = 0;
        }
    }
    
    zCollisionEvent(thisModel, otherModel)
    {
        if (otherModel.active && 
        ((thisModel.z >= (otherModel.z - otherModel.zSpeed)) && (thisModel.z <= otherModel.z)) &&
        (thisModel.x + thisModel.width >= otherModel.x) &&
        (thisModel.x <= otherModel.x + otherModel.width) &&
        (thisModel.y + thisModel.height >= otherModel.y) &&
        (thisModel.y <= otherModel.y + otherModel.height))
        {
            if("damageDealt" in otherModel && otherModel.damageDealt > 0 && thisModel.state != "exploding" && thisModel.state != "lost")
            {
                kernel.loadedModels[thisModel.loadedIndex].health -= otherModel.damageDealt;
                if(kernel.loadedModels[thisModel.loadedIndex].health <= 0)
                {
                    kernel.loadedModels[thisModel.loadedIndex].health = 0;
                    kernel.loadedModels[thisModel.loadedIndex].exploding = true;
                    kernel.loadedModels[thisModel.loadedIndex].display = true;
                }
                
                kernel.level.HUD.damageFlash.start(otherModel.color);
                kernel.level.HUD.update = true;
            }
        }
    }
    
    flash()
    {
        if(this.lastFlashChange == 0 || this.lastFlashChange + this.flashSpeed < getTotalMilliseconds())
        {
            this.display = !this.display;
            this.lastFlashChange = getTotalMilliseconds();
        }
    }
}
