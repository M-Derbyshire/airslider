import Model from '../../Model/Model';

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
    
    load(levelLeftEdge, levelRightEdge)
    {
        super.load(levelLeftEdge, levelRightEdge);
        
        this.animationManager.registerAnimations({
            dropLeft: this.animationManager.createAnimation({
                path: "/assets/models/monsters/falcon/anim/dropping/left",
                frameCount: 1,
                fps: 24,
                width: 175,
                height: 300,
            }),
            dropRight: this.animationManager.createAnimation({
                path: "/assets/models/monsters/falcon/anim/dropping/right",
                frameCount: 1,
                fps: 24,
                width: 175,
                height: 300,
            }),
            flapping: this.animationManager.createAnimation({
                path: "/assets/models/monsters/falcon/anim/flapping",
                frameCount: 8,
                fps: 24,
                width: 350,
                height: 200,
            }),
            left: this.animationManager.createAnimation({
                path: "/assets/models/monsters/falcon/anim/left",
                frameCount: 1,
                fps: 24,
                width: 350,
                height: 200,
            }),
            right: this.animationManager.createAnimation({
                path: "/assets/models/monsters/falcon/anim/right",
                frameCount: 1,
                fps: 24,
                width: 350,
                height: 200,
            }),
            riseLeft: this.animationManager.createAnimation({
                path: "/assets/models/monsters/falcon/anim/rising/left",
                frameCount: 1,
                fps: 24,
                width: 170,
                height: 300,
            }),
            riseRight: this.animationManager.createAnimation({
                path: "/assets/models/monsters/falcon/anim/rising/right",
                frameCount: 1,
                fps: 24,
                width: 170,
                height: 300,
            }),
        });
        
        
        this.actions = [
            this.stalking,
            this.strafe,
            this.swoopDown,
            this.swoopUp,
            this.reposition
        ];
        
        this.player = this.kernel.loadedModels[this.playerIndex];
        
        this.enterXSpeed = 140;
        this.offScreenUnits = 800;
        this.startY = 75;
        this.startX = this._levelLeftEdge - this.offScreenUnits;
        this.startZ = this.kernel.loadedModels[this.playerIndex].z;
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
            
            if(this.x > (this._levelRightEdge + this.offScreenUnits))
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
        this.swoopWait = 6000; // 6 seconds for first one (will be changed with random() later)
        this.y = this.startY;
        this.x = this.startX;
        this.z = this.startZ;
        
        //This means that if the player moves in the same direction 
        //during strafe(), the monster doesn't end up off screen.
        this.xSpeed = this.kernel.loadedModels[this.playerIndex].topSpeed * 2.5;
        
        this.ySpeed = 1200;
        this.state = "flapping";
    }
    
    //movement-----------------------------------------------------
    
    stalking(monster)
    {
        //Reset the damage (It's set to 0 in swoopUp() to avoid extra damage)
        monster.damageDealt = monster.damageDealtOrig;
        
        //keep monster centered above player
        monster.x = monster.player.x + (monster.player.width / 2) - (monster.width / 2);
        
        if(monster.helpers.time.getTotalMilliseconds() - monster.lastSwoop >= monster.swoopWait)
        {
            monster.swoopWait = (Math.random() * 3000) + 1000; //between 1 and 4 seconds
            // will set the lastSwoop time after swooping has finished
            
            if(monster.x + (monster.width / 2) > (monster._levelRightEdge - monster._levelLeftEdge) / 2)
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
        // Center of monster in drop animations
        // Width/height should be the same for both dropLeft and dropRight anims.
        const monsterDropLeftAnim = monster.animationManager.animations.dropLeft;
        const monsterSwoopXCenter = monster.x + (monsterDropLeftAnim.width / 2);
        const monsterSwoopYcenter = monster.y + (monsterDropLeftAnim.height / 2);
        
        
        const player = monster.kernel.loadedModels[monster.playerIndex];
        const playerXCenter = player.x + (player.width / 2);
        const playerYCenter = player.y + (player.height / 2);
        
        // Always a positive when in the air.
        const yDifference = playerYCenter - monsterSwoopYcenter; 
        
        // Need this to always be positive, so we can just see if it's greater
        // than the yDifference for either direction.
        let xDifference = playerXCenter - monsterSwoopXCenter;
        if(xDifference < 0) xDifference = -xDifference;
        
        //Monster will switch to swooping down with the same speed for x and y.
        //So, if the xDifference and yDifference match, it's time to swoop, 
        //as it's correctly aimed at the player.
        if(xDifference >= yDifference)
        {
            monster.directionMultiplier = -monster.directionMultiplier;
            monster.state = (monster.directionMultiplier == -1) ? "dropLeft" : "dropRight";
            monster.nextAction();
        } 
        else 
        {
            monster.moveRight(monster.xSpeed * monster.directionMultiplier);
        }
    }
    
    swoopDown(monster)
    {
        //y speed is used for both x and y movement, so it's diagonal.
        //This is important to make sure the falcon hits the target
        monster.moveRight(monster.ySpeed * monster.directionMultiplier);
        monster.moveDown(monster.ySpeed);
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
            
            //0.75 makes the movement angle match the angle on the animation sprite
            monster.moveRight((monster.ySpeed * 0.75) * monster.directionMultiplier);
        }
    }
    
    reposition(monster)
    {
        //get player center and monster center; also pre-calculate the real speed of the monster
        const playerCenter = monster.kernel.loadedModels[monster.playerIndex].x + (monster.kernel.loadedModels[monster.playerIndex].width / 2)
        const monsterCenter = monster.x + (monster.width / 2);
        const calcSpeed = monster.helpers.unit.xSpeed(monster.xSpeed);
        
        if(monsterCenter < playerCenter + calcSpeed && monsterCenter > playerCenter - calcSpeed)
        {
            monster.lastSwoop = monster.helpers.time.getTotalMilliseconds();
            monster.nextAction();
        } else {
            monster.directionMultiplier = (playerCenter < monsterCenter) ? -1 : 1;
            monster.moveRight(monster.xSpeed * monster.directionMultiplier);
        }
    }
    
    //events------------------------------------------------------------
    
    hitPlayerOrGroundEventAction(otherModel)
    {
        if(this.state == "dropLeft" || this.state == "dropRight")
        {
            // if the monster didn't collide with the ground
            if(this.y + this.height < this.kernel.unitsWithinCamera)
            {
                this.directionMultiplier = -this.directionMultiplier;
            }
            
            this.state = (this.directionMultiplier == -1) ? "riseLeft" : "riseRight";
            this.nextAction();
        }
    }
}