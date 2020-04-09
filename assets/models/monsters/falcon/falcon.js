class Falcon extends Monster {
    constructor(playerIndex)
    {
        super(Monster);
        
        this.playerIndex = playerIndex;
        
        this.overlapping = false;
        
        this.damageDealtOrig = 12;
        this.damageDealt; // will be 0 when rising, so as to not do more damage
        this.color = "none";
    }
    
    load()
    {
        let unitHelper = this.helpers.unit;
        
        this.animationManager.registerAnimations({
            dropLeft: this.animationManager.createAnimation({
                path: "/assets/models/monsters/falcon/anim/dropping/left",
                frameCount: 1,
                fps: 24,
                width: unitHelper.xUnit(175),
                height: unitHelper.yUnit(300),
            }),
            dropRight: this.animationManager.createAnimation({
                path: "/assets/models/monsters/falcon/anim/dropping/right",
                frameCount: 1,
                fps: 24,
                width: unitHelper.xUnit(175),
                height: unitHelper.yUnit(300),
            }),
            flapping: this.animationManager.createAnimation({
                path: "/assets/models/monsters/falcon/anim/flapping",
                frameCount: 8,
                fps: 24,
                width: unitHelper.xUnit(350),
                height: unitHelper.yUnit(200),
            }),
            left: this.animationManager.createAnimation({
                path: "/assets/models/monsters/falcon/anim/left",
                frameCount: 1,
                fps: 24,
                width: unitHelper.xUnit(350),
                height: unitHelper.yUnit(200),
            }),
            right: this.animationManager.createAnimation({
                path: "/assets/models/monsters/falcon/anim/right",
                frameCount: 1,
                fps: 24,
                width: unitHelper.xUnit(350),
                height: unitHelper.yUnit(200),
            }),
            riseLeft: this.animationManager.createAnimation({
                path: "/assets/models/monsters/falcon/anim/rising/left",
                frameCount: 1,
                fps: 24,
                width: unitHelper.xUnit(170),
                height: unitHelper.yUnit(300),
            }),
            riseRight: this.animationManager.createAnimation({
                path: "/assets/models/monsters/falcon/anim/rising/right",
                frameCount: 1,
                fps: 24,
                width: unitHelper.xUnit(170),
                height: unitHelper.yUnit(300),
            }),
        });
        
        this.registerEvent(["Tarian"], this.hitPlayerOrGroundEvent);
        
        this.actions = [
            this.stalking,
            this.strafe,
            this.swoopDown,
            this.swoopUp,
            this.reposition
        ];
        
        this.player = this.kernel.loadedModels[this.playerIndex];
        
        this.enterXSpeed = 140;
        this.offScreenUnits = unitHelper.xUnit(800);
        this.startY = unitHelper.yUnit(75);
        this.startX = this.kernel.level.leftEdge - this.offScreenUnits;
        this.startZ = this.kernel.loadedModels[this.playerIndex].z;
        this.ySpeed = 1200;
        this.dropWaitOffset = this.helpers.time.secondsToFrames(5);
        this.dropWaitRange = this.helpers.time.secondsToFrames(5);
        
        this.reset();
    }
    
    //entering and exiting and reseting-----------------------------------------
    
    enter()
    {
        // move until centered above player
        if(this.x + (this.width / 2) < this.player.x + (this.player.width / 2))
        {
            this.moveRight(this.enterXSpeed);
        } else {
            this.lastSwoop = this.helpers.time.getTotalMilliseconds();
            this.entering = false;
        }
    }
    
    exit()
    {
        if(this.y == this.startY)
        {
            this.state = "flapping";
        
            this.moveRight(this.enterXSpeed);
            
            if(this.x > (this.kernel.level.rightEdge + this.offScreenUnits))
            {
                this.exiting = false;
                this.active = false;
            }
        } else {
            this.actions[this.currentAction](this.kernel.loadedModels[this.loadedIndex]); //run the current action
        }
    }
    
    reset()
    {
        this.lastSwoop = -1;
        this.directionMultiplier = 1; //1 for right, -1 for left
        this.swoopWait = 6000; // 6 seconds for first one
        this.y = this.startY;
        this.x = this.startX;
        this.z = this.startZ;
        this.xSpeed = 960;
        this.ySpeed = 1200;
        this.state = "flapping";
    }
    
    //movement-----------------------------------------------------
    
    stalking(monster)
    {
        //reset the damage
        monster.damageDealt = monster.damageDealtOrig;
        
        //keep monster centered above player
        monster.x = monster.player.x + (monster.player.width / 2) - (monster.width / 2);
        
        if(monster.helpers.time.getTotalMilliseconds() - monster.lastSwoop >= monster.swoopWait)
        {
            monster.swoopWait = (Math.random() * 3000) + 1000; //between 1 and 4 seconds
            // will set the lastSwoop time after swooping has finished
            
            if(monster.x + (monster.width / 2) > (monster.kernel.level.rightEdge - monster.kernel.level.leftEdge) / 2)
            {
                monster.directionMultiplier = -1;
                monster.state = "left";
            } else {
                monster.directionMultiplier = 1;
                monster.state = "right";
            }
            
            monster.nextAction();
        }
    }
    
    strafe(monster)
    {
        let mx = monster.x;
        let mw = monster.x + monster.width;
        let px = monster.kernel.loadedModels[monster.playerIndex].x;
        let pw = monster.kernel.loadedModels[monster.playerIndex].width;
        let yDifference = monster.kernel.loadedModels[monster.playerIndex].y - monster.y;
        
        // if the position is correct for a swoop down
        if((mx - yDifference > px && mx - yDifference < px + pw) || //moving left
            (mw + yDifference > px && mw + yDifference < px + pw)) //moving right
        {
            monster.directionMultiplier = -monster.directionMultiplier;
            monster.state = (monster.directionMultiplier == -1) ? "dropLeft" : "dropRight";
            monster.nextAction();
        } else {
            monster.moveRight(monster.xSpeed * monster.directionMultiplier);
        }
    }
    
    swoopDown(monster)
    {
        //center of monster and player
        let mc = monster.x + (monster.width / 2);
        let pc = monster.kernel.loadedModels[monster.playerIndex].x + (monster.kernel.loadedModels[monster.playerIndex].width / 2);
        
        let directionChange = 5;
        
        //check which is further: x difference or y difference
        if((mc - pc) * -monster.directionMultiplier > monster.kernel.loadedModels[monster.playerIndex].y - monster.y)
        {
            monster.moveRight((monster.xSpeed + directionChange) * monster.directionMultiplier);
            monster.moveDown(monster.ySpeed);
        } else {
            monster.moveRight(monster.xSpeed * monster.directionMultiplier);
            monster.moveDown(monster.ySpeed + directionChange);
        }
    }
    
    swoopUp(monster)
    {
        if(monster.y <= monster.startY)
        {
            monster.y = monster.startY;
            monster.state = "flapping";
            monster.nextAction();
        } else {
            monster.damageDealt = 0; //will be reset at stalking
            monster.moveUp(monster.ySpeed);
            monster.moveRight((monster.xSpeed * 0.75) * monster.directionMultiplier);
        }
    }
    
    reposition(monster)
    {
        //get player center and monster center; also pre-calculate the real speed of the monster
        let pc = monster.kernel.loadedModels[monster.playerIndex].x + (monster.kernel.loadedModels[monster.playerIndex].width / 2)
        let mc = monster.x + (monster.width / 2);
        let calcSpeed = monster.helpers.unit.xSpeed(monster.xSpeed);
        
        if(mc < pc + calcSpeed && mc > pc - calcSpeed)
        {
            monster.lastSwoop = monster.helpers.time.getTotalMilliseconds();
            monster.nextAction();
        } else {
            monster.directionMultiplier = (pc < mc) ? -1 : 1;
            monster.moveRight(monster.xSpeed * monster.directionMultiplier);
        }
    }
    
    //events------------------------------------------------------------
    
    hitPlayerOrGroundEvent(thisModel, otherModel, kernel)
    {
        if(((thisModel.x + thisModel.width >= otherModel.x) &&
        (thisModel.x <= otherModel.x + otherModel.width) &&
        (thisModel.y + thisModel.height >= otherModel.y) &&
        (thisModel.y <= otherModel.y + otherModel.height)) || 
        (thisModel.y + thisModel.height >= kernel.graphicEn.gameCan.height))
        {
            if(thisModel.state == "dropLeft" || thisModel.state == "dropRight")
            {
                // if the monster didn't collide with the ground
                if(thisModel.y + thisModel.height < kernel.graphicEn.gameCan.height)
                {
                    thisModel.directionMultiplier = -thisModel.directionMultiplier;
                }
                
                thisModel.state = (thisModel.directionMultiplier == -1) ? "riseLeft" : "riseRight";
                thisModel.nextAction();
            }
        }
    }
}