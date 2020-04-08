class BabyDragon extends Monster {
    constructor(playerIndex, lavaBallIndex)
    {
        super(Monster);
        
        this.playerIndex = playerIndex;
        this.lavaBallIndex = lavaBallIndex;
    }
    
    load()
    {
        this.animationManager.registerAnimations({
            left: this.animationManager.createAnimation({
                path: "/assets/models/monsters/babyDragon/anim/left",
                frameCount: 4,
                fps: 24,
                width: xUnit(400),
                height: yUnit(300)
            }),
            right: this.animationManager.createAnimation({
                path: "/assets/models/monsters/babyDragon/anim/right",
                frameCount: 4,
                fps: 24,
                width: xUnit(400),
                height: yUnit(300)
            })
        });
        
        this.actions = [
            this.move
        ];
        
        this.offScreenUnits = 500;
        this.startY = yUnit(10),
        this.startX = this.kernel.level.rightEdge + this.offScreenUnits;
        
        this.startZ = this.kernel.loadedModels[this.playerIndex].z;
        this.enterXSpeed = 90;
        
        //set the z of the lava ball
        this.kernel.loadedModels[this.lavaBallIndex].z = this.startZ;
        
        this.reset();
    }
    
    //entering and exiting and reseting-----------------------------------------
    
    enter()
    {
        if(this.kernel.level.rightEdge < (this.x + this.width))
        {
            this.moveLeft(this.enterXSpeed);
        } else {
            this.entering = false;
        }
    }
    
    exit()
    {
        this.state = "left";
        this.moveLeft(this.enterXSpeed);
        
        if((this.x + this.width) < (this.kernel.level.leftEdge - this.offScreenUnits))
        {
            this.exiting = false;
            this.active = false;
        }
    }
    
    reset()
    {
        this.xSpeed = -720;
        this.x = this.startX;
        this.y = this.startY;
        this.z = this.startZ;
        this.state = "left";
    }
    
    //movement-----------------------------------------------------
    
    move(monster)
    {
        monster.moveRight(monster.xSpeed);
        
        if(monster.x + (monster.width / 2) <= monster.kernel.level.leftEdge || (monster.x + (monster.width / 2) >= monster.kernel.level.rightEdge))
        {
            monster.xSpeed = -monster.xSpeed;
            monster.state = (monster.state == "left") ? "right" : "left";
            
            monster.x = (monster.xSpeed > 0) ? 
                ((monster.kernel.level.leftEdge - (monster.width / 2)) + 1) :
                ((monster.kernel.level.rightEdge - (monster.width / 2)) - 1);
        }
        
        if(!monster.kernel.loadedModels[monster.lavaBallIndex].active && monster.fireWeapon)
        {
            monster.dropBall(monster);
        }
    }
    
    //attacks-----------------------------------------------------
    dropBall(monster)
    {
        let l = monster.kernel.loadedModels[monster.lavaBallIndex];
        
        //center it
        let xOffset = -xUnit(65);
        
        if(monster.state == "right")
        {
            xOffset = -xOffset - xUnit(25);
        }
        
        l.x = monster.x + (monster.width / 2) + xOffset;
        l.y = monster.y + monster.height + -yUnit(20);
        
        l.state = "drop";
        l.active = true;
    }
    
    //events------------------------------------------------------------
    
    //none for this monster
    //events are for the lava ball
}