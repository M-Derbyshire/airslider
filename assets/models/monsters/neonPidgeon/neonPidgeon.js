class NeonPidgeon extends Monster {
    constructor(playerIndex, otherMonster = false)
    {
        super(Monster);
        
        this.playerIndex = playerIndex;
        this.specialLevel = otherMonster;
        this.overlapping = false;
        
        this.damageDealt = 10;
        this.color = "none";
    }
    
    load()
    {
        this.anims = {
            falling: this.registerAnim({
                path: kernel.rootPath + "/assets/models/monsters/neonPidgeon/anim/falling",
                frameCount: 1,
                fps: 24,
                width: xUnit(250),
                height: yUnit(200),
            }),
            flapping: this.registerAnim({
                path: kernel.rootPath + "/assets/models/monsters/neonPidgeon/anim/flapping",
                frameCount: 4,
                fps: 24,
                width: xUnit(250),
                height: yUnit(200),
            }),
            rising: this.registerAnim({
                path: kernel.rootPath + "/assets/models/monsters/neonPidgeon/anim/rising",
                frameCount: 1,
                fps: 24,
                width: xUnit(250),
                height: yUnit(200),
            }),
        };
        
        this.registerEvent(["NeonPidgeon"], this.overlappingEvent);
        this.registerEvent(["Tarian"], this.hitPlayerOrGroundEvent);
        
        this.actions = [
            this.moveSideways,
            this.drop,
            this.rise
        ];
        
        this.enterXSpeed = 90;
        this.offScreenUnits = (this.specialLevel) ? xUnit(500) : xUnit(800);
        this.startY = (this.specialLevel) ? yUnit(250) : yUnit(150);
        this.startX = kernel.level.rightEdge + this.offScreenUnits;
        this.startZ = kernel.loadedModels[this.playerIndex].z;
        this.ySpeed = 1200;
        this.dropWaitOffset = secondsToFrames(5);
        this.dropWaitRange = secondsToFrames(5);
        
        this.reset();
    }
    
    //entering and exiting and reseting-----------------------------------------
    
    enter()
    {
        if(kernel.level.rightEdge < (this.x + this.anims[this.state].width))
        {
            this.moveLeft(this.enterXSpeed);
        } else {
            this.entering = false;
            this.lastDrop = kernel.level.framesPassed;
        }
    }
    
    exit()
    {
        if(this.y != this.startY)
        {
            //if not at correct height, don't leave yet
            this.changeState("rising");
            this.rise(kernel.loadedModels[this.loadedIndex]);
        } else {
            this.changeState("flapping");
        
            this.moveLeft(this.enterXSpeed);
            
            if((this.x + this.anims[this.state].width) < (kernel.level.leftEdge - this.offScreenUnits))
            {
                this.exiting = false;
                this.active = false;
            }
        }
    }
    
    reset()
    {
        this.lastDrop = 0;
        this.dropWait = -1;
        this.y = this.startY;
        this.x = this.startX;
        this.z = this.startZ;
        this.xSpeed = (this.specialLevel) ? -1080 : -960;
        this.changeState("flapping");
    }
    
    //movement-----------------------------------------------------
    
    moveSideways(monster)
    {
        monster.x += xSpeed(monster.xSpeed);
        
        if(monster.x <= kernel.level.leftEdge || monster.x + monster.anims[monster.state].width >= kernel.level.rightEdge)
        {
            monster.xSpeed = -monster.xSpeed;
            
            monster.x = (monster.xSpeed > 0) ? 
                (kernel.level.leftEdge + 1) :
                ((kernel.level.rightEdge - monster.anims[monster.state].width) - 1);
        }
        
        if(monster.dropWait == -1)
        {
            monster.dropWait = monster.dropWaitOffset + Math.floor(Math.random() * monster.dropWaitRange);
        } else if((kernel.level.framesPassed >= monster.lastDrop + monster.dropWait) && 
            !monster.overlapping && 
            ((monster.x + monster.anims[monster.state].width >= kernel.loadedModels[monster.playerIndex].x) && 
            (monster.x <= kernel.loadedModels[monster.playerIndex].x + kernel.loadedModels[monster.playerIndex].anims[kernel.loadedModels[monster.playerIndex].state].width)))
        {
            monster.dropWaitOffset = monster.lastDrop + monster.dropWait;
            monster.dropWait = -1;
            monster.changeState("falling");
            monster.nextAction();
        }
        
        monster.overlapping = false; //this will be set to true by event if true, so end on this.
    }
    
    drop(monster)
    {
        monster.moveDown(monster.ySpeed);
    }
    
    rise(monster)
    {
        monster.moveUp(monster.ySpeed);
        
        if(monster.y <= monster.startY)
        {
            monster.y = monster.startY;
            monster.changeState("flapping");
            monster.nextAction();
        }
    }
    
    //events------------------------------------------------------------
    
    overlappingEvent(thisModel, otherModel)
    {
        if(((thisModel.x + thisModel.anims[thisModel.state].width) >= otherModel.x) &&
        (thisModel.x <= (otherModel.x + otherModel.anims[otherModel.state].width)))
        {
            kernel.loadedModels[thisModel.loadedIndex].overlapping = true;
        }
    }
    
    hitPlayerOrGroundEvent(thisModel, otherModel)
    {
        if(((thisModel.x + thisModel.anims[thisModel.state].width >= otherModel.x) &&
        (thisModel.x <= otherModel.x + otherModel.anims[otherModel.state].width) &&
        (thisModel.y + thisModel.anims[thisModel.state].height >= otherModel.y) &&
        (thisModel.y <= otherModel.y + otherModel.anims[otherModel.state].height)) || 
        (thisModel.y + thisModel.anims[thisModel.state].height >= kernel.graphicEn.gameCan.height))
        {
            if(((thisModel.y + thisModel.anims[thisModel.state].height) > otherModel.y) && 
            (thisModel.y + thisModel.anims[thisModel.state].height < kernel.graphicEn.gameCan.height))
            {
                //makes sure the player doesn't lose extra health if they collide from the side
                kernel.loadedModels[thisModel.loadedIndex].y = otherModel.y - thisModel.anims[thisModel.state].height - 1;
            }
            
            if(thisModel.state == "falling")
            {
                kernel.loadedModels[thisModel.loadedIndex].changeState("rising");
                kernel.loadedModels[thisModel.loadedIndex].nextAction();
            }
        }
    }
}