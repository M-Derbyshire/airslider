import Monster from '/assets/models/Monster/monster';

export default class BabyDragon extends Monster {
    constructor(playerModel, lavaBall)
    {
        super(Monster);
        
        this.playerModel = playerModel;
        this.lavaBall = lavaBall;
    }
    
    load()
    {
        super.load();
        
        this._assetsToUnload.push("/assets/models/monsters/babyDragon/anim/babyDragon-spritesheet.png");
        
        this.animationManager.registerAnimations({
            left: this.animationManager.createAnimation({
                sheetPath: "/assets/models/monsters/babyDragon/anim/babyDragon-spritesheet.png",
                fps: 24,
                drawWidth: 400,
                drawHeight: 300,
				frameCoordinates: [
					{ x: 0, y: 0, width: 474, height: 187 },
					{ x: 0, y: 188, width: 474, height: 187 },
					{ x: 0, y: 376, width: 474, height: 187 },
					{ x: 0, y: 564, width: 474, height: 187 },
					{ x: 0, y: 752, width: 474, height: 187 },
					{ x: 0, y: 940, width: 474, height: 187 },
					{ x: 0, y: 1128, width: 474, height: 187 },
					{ x: 0, y: 1316, width: 474, height: 187 },
					{ x: 0, y: 1504, width: 474, height: 187 },
					{ x: 0, y: 1692, width: 474, height: 187 },
				]
            }),
            right: this.animationManager.createAnimation({
                sheetPath: "/assets/models/monsters/babyDragon/anim/babyDragon-spritesheet.png",
                fps: 24,
                drawWidth: 400,
                drawHeight: 300,
				frameCoordinates: [
					{ x: 0, y: 1879, width: 474, height: 187 },
					{ x: 0, y: 2067, width: 474, height: 187 },
					{ x: 0, y: 2255, width: 474, height: 187 },
					{ x: 0, y: 2443, width: 474, height: 187 },
					{ x: 0, y: 2631, width: 474, height: 187 },
					{ x: 0, y: 2819, width: 474, height: 187 },
					{ x: 0, y: 3007, width: 474, height: 187 },
					{ x: 0, y: 3195, width: 474, height: 187 },
					{ x: 0, y: 3383, width: 474, height: 187 },
					{ x: 0, y: 3571, width: 474, height: 187 },
				]
            })
        });
        
        this.state = "left";
        
    }
    
    prepare()
    {
        super.prepare();
        
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
        
		this._handleOverlappingOfLevelEdges();
        
        this._dropBallIfTime();
    }
	
	_handleOverlappingOfLevelEdges()
	{
		const hasOverlappedLeftEdge = (this.x + (this.width / 2) <= this._levelLeftEdge);
		const hasOverlappedRightEdge = (this.x + (this.width / 2) >= this._levelRightEdge);
		
        if(hasOverlappedLeftEdge || hasOverlappedRightEdge)
        {
            this.xSpeed = -this.xSpeed;
            this.state = (this.state == "left") ? "right" : "left";
            
            this.x = (this.xSpeed > 0) ? 
                ((this._levelLeftEdge - (this.width / 2)) + 1) :
                ((this._levelRightEdge - (this.width / 2)) - 1);
        }
	}
	
	_dropBallIfTime()
	{
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