class BabyDragon extends Monster {
    constructor(playerIndex, lavaBallIndex)
    {
        super(Monster);
        
        this.playerIndex = playerIndex;
        this.lavaBallIndex = lavaBallIndex;
    }
    
    load()
    {
        this.anims = {
            left: this.registerAnim({
                path: kernel.rootPath + "/assets/models/monsters/babyDragon/anim/left",
                frameCount: 4,
                fps: 24,
                width: xUnit(400),
                height: yUnit(300)
            }),
            right: this.registerAnim({
                path: kernel.rootPath + "/assets/models/monsters/babyDragon/anim/right",
                frameCount: 4,
                fps: 24,
                width: xUnit(400),
                height: yUnit(300)
            })
        };
        
        this.actions = [
            this.move
        ];
        
        this.offScreenUnits = 500;
        this.startY = yUnit(10),
        this.startX = kernel.level.rightEdge + this.offScreenUnits;
        
        this.startZ = kernel.loadedModels[this.playerIndex].z;
        this.enterXSpeed = 90;
        
        //set the z of the lava ball
        kernel.loadedModels[this.lavaBallIndex].z = this.startZ;
        
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
        }
    }
    
    exit()
    {
        this.changeState("left");
        this.moveLeft(this.enterXSpeed);
        
        if((this.x + this.anims[this.state].width) < (kernel.level.leftEdge - this.offScreenUnits))
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
        this.changeState("left");
    }
    
    //movement-----------------------------------------------------
    
    move(monster)
    {
        monster.x += xSpeed(monster.xSpeed);
        
        if(monster.x + (monster.anims[monster.state].width / 2) <= kernel.level.leftEdge || (monster.x + (monster.anims[monster.state].width / 2) >= kernel.level.rightEdge))
        {
            monster.xSpeed = -monster.xSpeed;
            monster.changeState(
                (monster.state == "left") ? "right" : "left"
            );
            
            monster.x = (monster.xSpeed > 0) ? 
                ((kernel.level.leftEdge - (monster.anims[monster.state].width / 2)) + 1) :
                ((kernel.level.rightEdge - (monster.anims[monster.state].width / 2)) - 1);
        }
        
        if(!kernel.loadedModels[monster.lavaBallIndex].active && monster.fireWeapon)
        {
            monster.dropBall(monster);
        }
    }
    
    //attacks-----------------------------------------------------
    dropBall(monster)
    {
        let l = kernel.loadedModels[monster.lavaBallIndex];
        
        //center it
        let xOffset = -xUnit(65);
        
        if(monster.state == "right")
        {
            xOffset = -xOffset - xUnit(25);
        }
        
        l.x = monster.x + (monster.anims[monster.state].width / 2) + xOffset;
        l.y = monster.y + monster.anims[monster.state].height + -yUnit(20);
        
        l.changeState("drop");
        l.active = true;
    }
    
    //events------------------------------------------------------------
    
    //none for this monster
    //events are for the lava ball
}