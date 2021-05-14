import Monster from '/assets/models/Monster/monster';

export default class BabyDragon extends Monster {
    constructor(playerModel, lavaBall)
    {
        super(Monster);
        
        this.playerModel = playerModel;
        this.lavaBall = lavaBall;
    }
    
    load(levelLeftEdge, levelRightEdge)
    {
        super.load(levelLeftEdge, levelRightEdge);
        
        this.animationManager.registerAnimations({
            left: this.animationManager.createAnimation({
                path: "/assets/models/monsters/babyDragon/anim/left",
                frameCount: 4,
                fps: 24,
                width: 400,
                height: 300
            }),
            right: this.animationManager.createAnimation({
                path: "/assets/models/monsters/babyDragon/anim/right",
                frameCount: 4,
                fps: 24,
                width: 400,
                height: 300
            })
        });
        
        this.actions = [
            this.move
        ];
        
        this.offScreenUnits = 500;
        this.startY = 10,
        this.startX = this._levelRightEdge + this.offScreenUnits;
        
        this.startZ = this.playerModel.z;
        this.enterXSpeed = 90;
        
        //set the z of the lava ball
        this.lavaBall.z = this.startZ;
        
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
        }
    }
    
    exit()
    {
        this.state = "left";
        this.moveLeft(this.enterXSpeed);
        
        if((this.x + this.width) < (this._levelLeftEdge - this.offScreenUnits))
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
    
    move()
    {
        this.moveRight(this.xSpeed);
        
        if(this.x + (this.width / 2) <= this._levelLeftEdge || (this.x + (this.width / 2) >= this._levelRightEdge))
        {
            this.xSpeed = -this.xSpeed;
            this.state = (this.state == "left") ? "right" : "left";
            
            this.x = (this.xSpeed > 0) ? 
                ((this._levelLeftEdge - (this.width / 2)) + 1) :
                ((this._levelRightEdge - (this.width / 2)) - 1);
        }
        
        if(!this.lavaBall.active && this.fireWeapon)
        {
            this.dropBall();
        }
    }
    
    //attacks-----------------------------------------------------
    dropBall()
    {
        let l = this.lavaBall;
        
        //center it
        let xOffset = -65;
        
        if(this.state == "right")
        {
            xOffset = -xOffset - 25;
        }
        
        l.x = this.x + (this.width / 2) + xOffset;
        l.y = this.y + this.height + -20;
        
        l.state = "drop";
        l.active = true;
    }
}