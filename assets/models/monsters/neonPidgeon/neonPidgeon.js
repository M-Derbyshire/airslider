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
                path: "/assets/models/monsters/neonPidgeon/anim/falling",
                frameCount: 1,
                fps: 24,
                width: xUnit(250),
                height: yUnit(200),
            }),
            flapping: this.registerAnim({
                path: "/assets/models/monsters/neonPidgeon/anim/flapping",
                frameCount: 4,
                fps: 24,
                width: xUnit(250),
                height: yUnit(200),
            }),
            rising: this.registerAnim({
                path: "/assets/models/monsters/neonPidgeon/anim/rising",
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
        this.exitXSpeed = 240;
        this.offScreenUnits = (this.specialLevel) ? xUnit(500) : xUnit(800);
        this.startY = (this.specialLevel) ? yUnit(250) : yUnit(150);
        this.startX = kernel.level.rightEdge + this.offScreenUnits;
        this.startZ = kernel.loadedModels[this.playerIndex].z;
        this.ySpeed = 1200;
        this.dropWaitOffset = 2000; //5 seconds
        this.dropWaitRange = 2000; //4 seconds
        this.initialDropWait = 8000;
        
        this.reset();
    }
    
    //entering and exiting and reseting-----------------------------------------
    
    enter()
    {
        if(kernel.level.rightEdge < (this.x + this.width))
        {
            this.moveLeft(this.enterXSpeed);
        } else {
            this.entering = false;
            this.nextDrop = getTotalMilliseconds() + this.initialDropWait;
        }
    }
    
    exit()
    {
        if(this.y != this.startY)
        {
            //if not at correct height, don't leave yet
            this.state = "rising";
            this.rise(kernel.loadedModels[this.loadedIndex]);
        } else {
            this.state = "flapping";
        
            this.moveLeft(this.exitXSpeed);
            
            if((this.x + this.width) < (kernel.level.leftEdge - this.offScreenUnits))
            {
                this.exiting = false;
                this.active = false;
            }
        }
    }
    
    reset()
    {
        this.nextDrop = -1;
        this.y = this.startY;
        this.x = this.startX;
        this.z = this.startZ;
        this.xSpeed = (this.specialLevel) ? -1080 : -960;
        this.state = "flapping";
    }
    
    //movement-----------------------------------------------------
    
    moveSideways(monster)
    {
        monster.moveRight(monster.xSpeed);
        
        if(monster.x <= kernel.level.leftEdge || monster.x + monster.width >= kernel.level.rightEdge)
        {
            monster.xSpeed = -monster.xSpeed;
            
            monster.x = (monster.xSpeed > 0) ? 
                (kernel.level.leftEdge + 1) :
                ((kernel.level.rightEdge - monster.width) - 1);
        }
        
        if(monster.nextDrop == -1)
        {
            monster.nextDrop = getTotalMilliseconds() + monster.dropWaitOffset + Math.floor(Math.random() * monster.dropWaitRange);
        } else if((getTotalMilliseconds() >= monster.nextDrop) && 
            !monster.overlapping && 
            ((monster.x + monster.width >= kernel.loadedModels[monster.playerIndex].x) && 
            (monster.x <= kernel.loadedModels[monster.playerIndex].x + kernel.loadedModels[monster.playerIndex].width)))
        {
            monster.nextDrop = -1;
            monster.state = "falling";
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
            monster.state = "flapping";
            monster.nextAction();
        }
    }
    
    //events------------------------------------------------------------
    
    overlappingEvent(thisModel, otherModel)
    {
        if(((thisModel.x + thisModel.width) >= otherModel.x) &&
        (thisModel.x <= (otherModel.x + otherModel.width)))
        {
            kernel.loadedModels[thisModel.loadedIndex].overlapping = true;
        }
    }
    
    hitPlayerOrGroundEvent(thisModel, otherModel)
    {
        if(((thisModel.x + thisModel.width >= otherModel.x) &&
        (thisModel.x <= otherModel.x + otherModel.width) &&
        (thisModel.y + thisModel.height >= otherModel.y) &&
        (thisModel.y <= otherModel.y + otherModel.height)) || 
        (thisModel.y + thisModel.height >= kernel.graphicEn.gameCan.height))
        {
            if(((thisModel.y + thisModel.height) > otherModel.y) && 
            (thisModel.y + thisModel.height < kernel.graphicEn.gameCan.height))
            {
                //makes sure the player doesn't lose extra health if they collide from the side
                kernel.loadedModels[thisModel.loadedIndex].y = otherModel.y - thisModel.height - 1;
            }
            
            if(thisModel.state == "falling")
            {
                kernel.loadedModels[thisModel.loadedIndex].state = "rising";
                kernel.loadedModels[thisModel.loadedIndex].nextAction();
            }
        }
    }
}