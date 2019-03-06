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
                width: xUnit(350),
                height: yUnit(250)
            }),
            right: this.registerAnim({
                path: kernel.rootPath + "/assets/models/monsters/babyDragon/anim/right",
                frameCount: 4,
                fps: 24,
                width: xUnit(350),
                height: yUnit(250)
            })
        };
        
        this.actions = [
            this.move
        ];
        
        this.offScreenUnits = 500;
        this.startY = yUnit(150),
        this.startX = kernel.level.rightEdge + this.offScreenUnits;
        
        this.startZ = kernel.loadedModels[this.playerIndex].z;
        this.enterXSpeed = xUnit(25);
        
        this.reset();
    }
    
    //entering and exiting and reseting-----------------------------------------
    
    enter()
    {
        if(kernel.level.rightEdge < (this.x + this.anims[this.state].width))
        {
            this.x -= this.enterXSpeed;
        } else {
            this.entering = false;
        }
    }
    
    exit()
    {
        this.changeState("left");
        this.x -= this.enterXSpeed;
        
        if((this.x + this.anims[this.state].width) < (kernel.level.leftEdge - this.offScreenUnits))
        {
            this.exiting = false;
            this.active = false;
        }
    }
    
    reset()
    {
        this.xSpeed = -xUnit(30);
        this.x = this.startX;
        this.y = this.startY;
        this.z = this.startZ;
        this.changeState("left");
    }
    
    //movement-----------------------------------------------------
    
    move(monster)
    {
        
    }
    
    //events------------------------------------------------------------
    
    
}