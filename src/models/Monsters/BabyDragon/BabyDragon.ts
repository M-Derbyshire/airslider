import Kernel from '../../../../Kernel/Kernel';
import IModelAnimationsManager from '../../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';
import Monster from '../../Monster/Monster';
import Tarian from '../../Tarian/Tarian';
import LavaBall from '../attacks/LavaBall/LavaBall';

/**
 * The Baby Dragon monster
 */
export default class BabyDragon extends Monster 
{
    private _playerModel:Tarian; // The player's model
    private _lavaBalls:LavaBall[]; // The lava ball models that the dragon will drop onto the player
    private _nextLavaBallIndex:number; // The "next" lava ball refers to the next one to drop (not the next one to select)
    private _nextDirectionToggleTime:number; // Determines when the monster should next toggle its direction
    private _initialXSpeed:number; // The initial speed of the monster (on the X axis), after the entrance movement
    private _wingSound:HTMLAudioElement; // The sound effect for the flapping of the wings
    
    // This model's animation runs at a lower framerate to the game. This stores the index of the last frame that was 
    // used. See the act() method for an explanation of how this relates to the sound effect.
    private _lastAnimFrame:number;
    
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
    }
    
    /**
     * The index for the alternate lava ball to the one we're dropping next
     */
    private get _altLavaBallIndex() {
        return (this._nextLavaBallIndex === this._lavaBalls.length - 1) 
            ? 0 
            : this._nextLavaBallIndex + 1;
    }
    
    load(animationManager:IModelAnimationsManager):void
    {
        super.load(animationManager);
        
        const assetHandler = Kernel.getInstance().assetHandler;
        
        const wingSoundPath = "/models/monsters/BabyDragon/sounds/flap.mp3";
        this._wingSound = assetHandler.loadAudio(wingSoundPath);
        this.assetsToUnload.push(wingSoundPath);
        
        const spritesheetPath = "/models/monsters/BabyDragon/anim/babyDragon-spritesheet.png";
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
        
        this.startY = 10,
        this.offScreenUnits = 500;
        this.startX = this.levelRightEdge + this.offScreenUnits;
        this.startZ = this._playerModel.z;
        
        this.x = this.startX;
        this.y = this.startY;
        this.z = this.startZ;
        
        this.state = "left";
        
        this.enterXSpeed = 90;
        this._initialXSpeed = -720;
        this.xSpeed = this._initialXSpeed;
        
        this._lavaBalls.forEach(lb => lb.z = this.startZ);
        this._nextLavaBallIndex = 0;
        
        this._lastAnimFrame = 0;
        this._wingSound.volume = 1;
    }
    
    act(): void {
        super.act();
        
        this._wingSound.volume = this.getVolumeForDistance();
        const flappingAnimation = this.animationManager.animations[this.state];
        
        // We want to run the sound effect on every wing flap.
        // The animation runs at a lower FPS to the rest of the game. We were having a buzzing sound because 
        // the animation's currentFrameIndex equaled 1 for quite a few game frames, so the sound was being 
        // repeatedly restarted. Therefore, we only want to run the sound when the animation frame has actually changed.
        const animationChangedFrame = this._lastAnimFrame !== flappingAnimation.currentFrameIndex;
        
        // The wing sound may restart too soon when changing between left/right animations.
        // Therefore, we run the sound on the last frame of the animation, not the first.
        if(animationChangedFrame && flappingAnimation.currentFrameIndex === flappingAnimation.frameCoordinates.length - 1)
            Kernel.getInstance().soundEngine.playSound(this._wingSound);
        
        this._lastAnimFrame = flappingAnimation.currentFrameIndex;
    }
    
    //entering, exiting and resetting-----------------------------------------
    
    start(): void {
        super.start();
        Kernel.getInstance().soundEngine.forceSoundLoad(this._wingSound);
    }
    
    enter():void
    {
        if(this.levelRightEdge < (this.x + this.width))
            this.moveLeft(this.enterXSpeed);
        else
            this.entering = false;
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
    
    // Movement-----------------------------------------------------
    
    /**
     * The movement action. Moves the dragon back and forth, and drops lava balls
     */
    private _move():void
    {
        this.moveRight(this.xSpeed); // May be a negative number, to move left
        
		this._handleOverlappingOfLevelEdges();
        
        this._dropBallIfTime();
        
        if(this._shouldChangeDirection())
            this._toggleDirection();
    }
	
    /**
     * Checks to see if the dragon is overlapping the level edges, and triggers the 
     * change of direction
     */
	private _handleOverlappingOfLevelEdges():void
	{
		const hasOverlappedLeftEdge = (this.x + (this.width / 2) <= this.levelLeftEdge);
		const hasOverlappedRightEdge = (this.x + (this.width / 2) >= this.levelRightEdge);
		
        if(hasOverlappedLeftEdge || hasOverlappedRightEdge)
        {
            this._toggleDirection();
            
            // Change the position, so we're no longer overlapping the edge
            this.x = (this.xSpeed > 0) ? 
                ((this.levelLeftEdge - (this.width / 2)) + 1) :
                ((this.levelRightEdge - (this.width / 2)) - 1);
            
            this.animationManager.resetCurrentFrameNumber();
        }
	}
    
    /**
     * Determines if it's time for the dragon to change direction (and generates the next time to change)
     * @returns true if the dragon should change direction, false if not
     */
    private _shouldChangeDirection():boolean
    {
        const runningTime = Kernel.getInstance().totalLevelActiveMilliseconds;
        
        // The initial time to change direction
        if(!this._nextDirectionToggleTime)
            this._nextDirectionToggleTime = runningTime + 5000;
        
        // We only want to change direction if the dragon is a certain distance from the edge of the level
        const areaSize = this.width / 8;
        const leftArea = this.levelLeftEdge + areaSize;
        const rightArea = this.levelRightEdge - areaSize;
        const monsterRightEdge = (this.x + this.width);
        
        const monsterIsWithinLeftArea = (this.x <= leftArea); 
        const monsterIsWithinRightArea = (monsterRightEdge >= rightArea);
        
        if(
            runningTime >= this._nextDirectionToggleTime && // Is it time to toggle?
            // We only want to start moving right if in the left area (or vice-versa)
            ((monsterIsWithinLeftArea && this.state === "left") || (monsterIsWithinRightArea && this.state === "right"))
        )
        {
            const newTimePeriod = (Math.random() * 4000) + 2000; //between 2 and 4 seconds
            this._nextDirectionToggleTime = runningTime + newTimePeriod;
            return true;
        }
        
        return false;
    }
    
    /**
     * Toggles the x direction of the dragon
     */
    private _toggleDirection():void
    {
        this.xSpeed = -this.xSpeed;
        this.state = (this.state === "left") ? "right" : "left";
    }
	
    /**
     * Checks if it's time to drop a lava ball, then triggers it
     */
	private _dropBallIfTime():void
	{
        const nextLavaBall = this._lavaBalls[this._nextLavaBallIndex];
        const altLavaBall = this._lavaBalls[this._altLavaBallIndex];
        
        if ((!altLavaBall.active && !nextLavaBall.active && this.fireWeapon) || //This will trigger the first drop
            //After the first drop, the below triggers any further drops
            (this.fireWeapon &&
            nextLavaBall.state !== "drop" && //When we check for this with .active, there's a bug where it can stop dropping balls
            (altLavaBall.y > Kernel.getInstance().unitsWithinCameraY / 1.5)))
        {
            this._dropBall();
            this._nextLavaBallIndex = this._altLavaBallIndex;
        }
	}
    
    // Attacks-----------------------------------------------------
    
    /**
     * Drops a lava ball, aimed at the player
     */
    private _dropBall():void
    {
        const ball = this._lavaBalls[this._nextLavaBallIndex];
        
        //center the ball
        let xOffset = -65;
        
        if(this.state == "right")
            xOffset = -xOffset - 25;
        
        ball.x = this.x + (this.width / 2) + xOffset;
        ball.y = this.y + this.height - 20;
        
        ball.state = "drop";
        ball.aimAtPlayer();
        ball.active = true;
    }
}