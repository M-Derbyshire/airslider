import Monster from '/assets/models/Monster/monster';

export default class BabyDragon extends Monster {
    constructor(playerModel, lavaBall1, lavaBall2)
    {
        super(Monster);
        
        this.playerModel = playerModel;
        this.lavaBalls = [lavaBall1, lavaBall2];
        
        //The "next" lava ball refers to the next one to drop (not the next one to select)
        //Also see the getter for prevLavaBallIndex
        this.nextLavaBallIndex = 0;
        
        this._nextDirectionToggleTime; // determines when the monster should next toggle its direction
    }
    
    get prevLavaBallIndex() {
        if(this.nextLavaBallIndex === this.lavaBalls.length - 1)
                return 0;
        
        return this.nextLavaBallIndex + 1;
    }
    
    load()
    {
        super.load();
        
        this._assetsToUnload.push("/assets/models/monsters/BabyDragon/anim/babyDragon-spritesheet.png");
        
        this.animationManager.registerAnimations({
            left: this.animationManager.createAnimation({
                sheetPath: "/assets/models/monsters/BabyDragon/anim/babyDragon-spritesheet.png",
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
                sheetPath: "/assets/models/monsters/BabyDragon/anim/babyDragon-spritesheet.png",
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
        this._initialXSpeed = -720;
        
        this.lavaBalls.forEach(lb => lb.z = this.startZ);
        
        this.reset();
    }
    
    getBoundaryBoxes()
    {
        return [];
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
        this.xSpeed = this._initialXSpeed;
        
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
        
        if(this._shouldChangeDirection())
            this._toggleDirection();
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
    
    _shouldChangeDirection()
    {
        const runningTime = this.kernel.totalLevelActiveMilliseconds;
        
        // Initial
        if(!this._nextDirectionToggleTime)
        {
            this._nextDirectionToggleTime = runningTime + 5000;
        }
        
        // We only want to change direction if monster is a certain distance from the edge of the level
        const areaSize = this.width / 8;
        const leftArea = this._levelLeftEdge + areaSize;
        const rightArea = this._levelRightEdge - areaSize;
        const monsterRightEdge = (this.x + this.width);
        
        const monsterIsWithinLeftArea = (this.x <= leftArea); 
        const monsterIsWithinRightArea = (monsterRightEdge >= rightArea);
        
        // Is it time to toggle, and is the monster close to the center
        if(runningTime >= this._nextDirectionToggleTime)
        {
            // We only want to start moving right if in the left area (or vice-versa)
            if((monsterIsWithinLeftArea && this.state === "left") || 
                (monsterIsWithinRightArea && this.state === "right"))
            {
                const newTimePeriod = (Math.random() * 4000) + 2000; //between 2 and 4 seconds
                this._nextDirectionToggleTime = runningTime + newTimePeriod;
                return true;
            }
        }
        
        return false;
    }
    
    _toggleDirection()
    {
        this.xSpeed = -this.xSpeed;
        this.state = (this.state === "left") ? "right" : "left";
    }
	
	_dropBallIfTime()
	{
        const prevLavaBall = this.lavaBalls[this.prevLavaBallIndex];
        
        if ((!prevLavaBall.active && !this.lavaBalls[this.nextLavaBallIndex].active && this.fireWeapon) //This will trigger the first drop
            //After the first drop, the below triggers an further drops
            || (this.fireWeapon 
            && !this.lavaBalls[this.nextLavaBallIndex].state !== "drop" //When we test this with .active, there's a bug where occasionally it stops dropping both balls
            && (prevLavaBall.y > this.kernel.unitsWithinCamera / 1.5)))
        {
            this.dropBall();
            this.nextLavaBallIndex = this.prevLavaBallIndex;
        }
	}
    
    //attacks-----------------------------------------------------
    dropBall()
    {
        let l = this.lavaBalls[this.nextLavaBallIndex];
        
        //center it
        let xOffset = -65;
        
        if(this.state == "right")
        {
            xOffset = -xOffset - 25;
        }
        
        l.x = this.x + (this.width / 2) + xOffset;
        l.y = this.y + this.height + -20;
        
        l.state = "drop";
        l.aimAtPlayer();
        l.active = true;
    }
}