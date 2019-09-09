class Falcon extends Monster {
    constructor(playerIndex, otherMonsterIndex = -1)
    {
        super(Monster);
        
        this.playerIndex = playerIndex;
        this.specialLevel = (otherMonsterIndex >= 0);
        this.wolfIndex = otherMonsterIndex;
        
        this.overlapping = false;
        
        this.damageDealt = 12;
        this.color = "none";
    }
    
    load()
    {
        this.anims = {
            dropLeft: this.registerAnim({
                path: kernel.rootPath + "/assets/models/monsters/falcon/anim/dropping/left",
                frameCount: 1,
                fps: 24,
                width: xUnit(450),
                height: yUnit(200),
            }),
            dropRight: this.registerAnim({
                path: kernel.rootPath + "/assets/models/monsters/falcon/anim/dropping/right",
                frameCount: 1,
                fps: 24,
                width: xUnit(450),
                height: yUnit(200),
            }),
            flapping: this.registerAnim({
                path: kernel.rootPath + "/assets/models/monsters/falcon/anim/flapping",
                frameCount: 8,
                fps: 24,
                width: xUnit(350),
                height: yUnit(200),
            }),
            left: this.registerAnim({
                path: kernel.rootPath + "/assets/models/monsters/falcon/anim/left",
                frameCount: 1,
                fps: 24,
                width: xUnit(350),
                height: yUnit(200),
            }),
            right: this.registerAnim({
                path: kernel.rootPath + "/assets/models/monsters/falcon/anim/right",
                frameCount: 1,
                fps: 24,
                width: xUnit(350),
                height: yUnit(200),
            }),
            riseLeft: this.registerAnim({
                path: kernel.rootPath + "/assets/models/monsters/falcon/anim/rising/left",
                frameCount: 1,
                fps: 24,
                width: xUnit(450),
                height: yUnit(250),
            }),
            riseRight: this.registerAnim({
                path: kernel.rootPath + "/assets/models/monsters/falcon/anim/rising/right",
                frameCount: 1,
                fps: 24,
                width: xUnit(450),
                height: yUnit(250),
            }),
        };
        
        this.registerEvent(["Tarian"], this.hitPlayerOrGroundEvent);
        
        this.actions = [
            this.stalking
        ];
        
        this.player = kernel.loadedModels[this.playerIndex];
        
        this.enterXSpeed = 140;
        this.offScreenUnits = xUnit(800);
        this.startY = yUnit(75);
        this.startX = kernel.level.leftEdge - this.offScreenUnits;
        this.startZ = kernel.loadedModels[this.playerIndex].z;
        this.ySpeed = 1200;
        this.dropWaitOffset = secondsToFrames(5);
        this.dropWaitRange = secondsToFrames(5);
        
        this.reset();
    }
    
    //entering and exiting and reseting-----------------------------------------
    
    enter()
    {
        // move until centered above player
        if(this.x + (this.anims[this.state].width / 2) < this.player.x + (this.player.anims[this.player.state].width / 2))
        {
            this.moveRight(this.enterXSpeed);
        } else {
            this.lastSwoop = getTotalMilliseconds();
            this.entering = false;
        }
    }
    
    exit()
    {
        if(this.y != this.startY)
        {
            //if not at correct height, don't leave yet
            
            //this.changeState("rising");
            //this.rise(kernel.loadedModels[this.loadedIndex]);
        } else {
            this.changeState("flapping");
        
            this.moveRight(this.enterXSpeed);
            
            if(this.x > (kernel.level.rightEdge + this.offScreenUnits))
            {
                this.exiting = false;
                this.active = false;
            }
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
        this.changeState("flapping");
    }
    
    //movement-----------------------------------------------------
    
    setDirection()
    {
        //this will set to either -1 or 1
        this.directionMultiplier = (Math.round(Math.random()) * 2) - 1;
    }
    
    stalking(monster)
    {
        //keep monster centered above player
        monster.x = monster.player.x + (monster.player.anims[monster.player.state].width / 2) - (monster.anims[monster.state].width / 2);
        
        if(getTotalMilliseconds() - monster.lastSwoop >= monster.swoopWait)
        {
            monster.swoopWait = (Math.random() * 3000) + 1000; //between 1 and 4 seconds
            monster.lastSwoop = getTotalMilliseconds();
            monster.setDirection();
            
            if(monster.directionMultiplier == -1)
            {
                monster.changeState("left");
            } else {
                monster.changeState("right");
            }
            
            monster.nextAction();
        }
    }
    
    
    //events------------------------------------------------------------
    
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