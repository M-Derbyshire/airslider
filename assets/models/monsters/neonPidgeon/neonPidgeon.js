import Monster from '/assets/models/Monster/monster';

export default class NeonPidgeon extends Monster {
    constructor(playerModel, otherMonster = false)
    {
        super(Monster);
        
        this.playerModel = playerModel;
        this.specialLevel = otherMonster;
        this.overlapping = false;
        
        this.damageDealt = 10;
        this.color = "none";
    }
    
    load(levelLeftEdge, levelRightEdge)
    {
        super.load(levelLeftEdge, levelRightEdge);
        
        this.animationManager.registerAnimations({
            falling: this.animationManager.createAnimation({
                path: "/assets/models/monsters/neonPidgeon/anim/falling",
                frameCount: 1,
                fps: 24,
                width: 250,
                height: 200,
            }),
            flapping: this.animationManager.createAnimation({
                path: "/assets/models/monsters/neonPidgeon/anim/flapping",
                frameCount: 4,
                fps: 24,
                width: 250,
                height: 200,
            }),
            rising: this.animationManager.createAnimation({
                path: "/assets/models/monsters/neonPidgeon/anim/rising",
                frameCount: 1,
                fps: 24,
                width: 250,
                height: 200,
            }),
        });
        
        this.actions = [
            this.moveSideways,
            this.drop,
            this.rise
        ];
        
        this.enterXSpeed = 90;
        this.exitXSpeed = 240;
        this.offScreenUnits = (this.specialLevel) ? 500 : 800;
        this.startY = (this.specialLevel) ? 250 : 150;
        this.startX = this._levelRightEdge + this.offScreenUnits;
        this.startZ = this.playerModel.z;
        this.ySpeed = 1800;
        this.dropWaitOffset = 2000; //5 seconds
        this.dropWaitRange = 2000; //4 seconds
        this.initialDropWait = 8000;
        
        this.reset();
    }
    
    //entering and exiting and reseting-----------------------------------------
    
    enter()
    {
        if(this._levelRightEdge < (this.x + this.width))
        {
            this.moveLeft(this.enterXSpeed);
        } else {
            this.entering = false;
            this.nextDrop = this.helpers.time.getTotalMilliseconds() + this.initialDropWait;
        }
    }
    
    exit()
    {
        if(this.y != this.startY)
        {
            //if not at correct height, don't leave yet
            this.state = "rising";
            this.rise(this.kernel.loadedModels[this.loadedIndex]);
        } else {
            this.state = "flapping";
        
            this.moveLeft(this.exitXSpeed);
            
            if((this.x + this.width) < (this._levelLeftEdge - this.offScreenUnits))
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
        
        if(monster.x <= monster._levelLeftEdge || monster.x + monster.width >= monster._levelRightEdge)
        {
            monster.xSpeed = -monster.xSpeed;
            
            monster.x = (monster.xSpeed > 0) ? 
                (monster._levelLeftEdge + 1) :
                ((monster._levelRightEdge - monster.width) - 1);
        }
        
        if(monster.nextDrop == -1)
        {
            monster.nextDrop = monster.helpers.time.getTotalMilliseconds() + monster.dropWaitOffset + Math.floor(Math.random() * monster.dropWaitRange);
        } else if((monster.helpers.time.getTotalMilliseconds() >= monster.nextDrop) && 
            !monster.overlapping && 
            ((monster.x + monster.width >= monster.playerModel.x) && 
            (monster.x <= monster.playerModel.x + monster.playerModel.width)))
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
    
    neonPidgeonOverlappingEventAction(otherModel)
    {
        this.overlapping = true;
    }
    
    hitPlayerOrGroundEventAction(otherModel)
    {
        if(((this.y + this.height) > otherModel.y) && 
            (this.y + this.height < this.kernel.unitsWithinCamera))
        {
            //makes sure the player doesn't lose extra health if they collide from the side
            this.y = otherModel.y - this.height - 1;
        }
        
        if(this.state == "falling" )
        {
            this.state = "rising";
            this.nextAction();
        }
    }
}