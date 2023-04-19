import IBoundaryBox from '../../Model/IBoundaryBox';
import Monster from '../../Monster/Monster';
import Tarian from '../../Tarian/Tarian';
import LavaBall from '../attacks/LavaBall/LavaBall';

/**
 * The Baby Dragon monster
 */
export default class BabyDragon extends Monster 
{
    private _playerModel:Tarian;
    private _lavaBalls:LavaBall[];
    private _nextLavaBallIndex:number;
    private _nextDirectionToggleTime:number; // determines when the monster should next toggle its direction
    private _initialXSpeed:number;
    
    /**
     * Constructor
     * @param playerModel The player model
     * @param lavaBall1 The model of the first lava ball
     * @param lavaBall2 The model of the second lava ball
     */
    constructor(playerModel:Tarian, lavaBall1:LavaBall, lavaBall2:LavaBall)
    {
        super();
        
        this._playerModel = playerModel;
        this._lavaBalls = [lavaBall1, lavaBall2];
        
        //The "next" lava ball refers to the next one to drop (not the next one to select)
        //Also see the getter for _prevLavaBallIndex
        this._nextLavaBallIndex = 0;
    }
    
    /**
     * The alternate lava ball to the one we're dropping next
     */
    private get _prevLavaBallIndex() {
        if(this._nextLavaBallIndex === this._lavaBalls.length - 1)
                return 0;
        
        return this._nextLavaBallIndex + 1;
    }
    
    load():void
    {
        super.load();
        
        const spritesheetPath = "/assets/models/monsters/BabyDragon/anim/babyDragon-spritesheet.png";
        this.assetsToUnload.push(spritesheetPath);
        
        this.animationManager.registerAnimations({
            left: this.animationManager.createAnimation({
                sheetPath: spritesheetPath,
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
                sheetPath: spritesheetPath,
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
    
    prepare():void
    {
        super.prepare();
        
        this.actions = [
            this._move
        ];
        
        this.offScreenUnits = 500;
        this.startY = 10,
        this.startX = this.levelRightEdge + this.offScreenUnits;
        
        this.startZ = this._playerModel.z;
        this.enterXSpeed = 90;
        this._initialXSpeed = -720;
        
        this._lavaBalls.forEach(lb => lb.z = this.startZ);
        
        this.reset();
    }
    
    getBoundaryBoxes():IBoundaryBox[]
    {
        return [];
    }
    
    //entering and exiting and reseting-----------------------------------------
    
    enter():void
    {
        if(this.levelRightEdge < (this.x + this.width))
        {
            this.moveLeft(this.enterXSpeed);
        } else {
            this.entering = false;
        }
    }
    
    exit():void
    {
        this.state = "left";
        this.moveLeft(this.enterXSpeed);
        
        if((this.x + this.width) < (this.levelLeftEdge - this.offScreenUnits))
        {
            this.exiting = false;
            this.active = false;
        }
    }
    
    reset():void
    {
        this.xSpeed = this._initialXSpeed;
        
        this.x = this.startX;
        this.y = this.startY;
        this.z = this.startZ;
        this.state = "left";
    }
    
    //movement-----------------------------------------------------
    
    private _move():void
    {
        this.moveRight(this.xSpeed);
        
		this._handleOverlappingOfLevelEdges();
        
        this._dropBallIfTime();
        
        if(this._shouldChangeDirection())
            this._toggleDirection();
    }
	
	private _handleOverlappingOfLevelEdges():void
	{
		const hasOverlappedLeftEdge = (this.x + (this.width / 2) <= this.levelLeftEdge);
		const hasOverlappedRightEdge = (this.x + (this.width / 2) >= this.levelRightEdge);
		
        if(hasOverlappedLeftEdge || hasOverlappedRightEdge)
        {
            this.xSpeed = -this.xSpeed;
            this.state = (this.state == "left") ? "right" : "left";
            
            this.x = (this.xSpeed > 0) ? 
                ((this.levelLeftEdge - (this.width / 2)) + 1) :
                ((this.levelRightEdge - (this.width / 2)) - 1);
        }
	}
    
    private _shouldChangeDirection():boolean
    {
        const runningTime = this.kernel.totalLevelActiveMilliseconds;
        
        // Initial
        if(!this._nextDirectionToggleTime)
        {
            this._nextDirectionToggleTime = runningTime + 5000;
        }
        
        // We only want to change direction if monster is a certain distance from the edge of the level
        const areaSize = this.width / 8;
        const leftArea = this.levelLeftEdge + areaSize;
        const rightArea = this.levelRightEdge - areaSize;
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
    
    private _toggleDirection():void
    {
        this.xSpeed = -this.xSpeed;
        this.state = (this.state === "left") ? "right" : "left";
    }
	
	private _dropBallIfTime():void
	{
        const prevLavaBall = this._lavaBalls[this._prevLavaBallIndex];
        
        if ((!prevLavaBall.active && !this._lavaBalls[this._nextLavaBallIndex].active && this.fireWeapon) //This will trigger the first drop
            //After the first drop, the below triggers an further drops
            || (this.fireWeapon 
            && this._lavaBalls[this._nextLavaBallIndex].state !== "drop" //When we test this with .active, there's a bug where occasionally it stops dropping both balls
            && (prevLavaBall.y > this.kernel.unitsWithinCamera / 1.5)))
        {
            this._dropBall();
            this._nextLavaBallIndex = this._prevLavaBallIndex;
        }
	}
    
    //attacks-----------------------------------------------------
    private _dropBall():void
    {
        let l = this._lavaBalls[this._nextLavaBallIndex];
        
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