import Kernel from '../../../../Kernel/Kernel';
import IModelAnimationsManager from '../../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';
import ASLevel from '../../../levels/ASLevel/ASLevel';
import Monster from '../../Monster/Monster';
import LavaBall from '../attacks/LavaBall/LavaBall';

/**
 * The Baby Dragon monster
 */
export default class BabyDragon extends Monster 
{
    private _lavaBalls:LavaBall[]; // The lava ball models that the dragon will drop onto the player
    private _nextLavaBallIndex:number; // The "next" lava ball refers to the next one to drop (not the next one to select)
    private _initialXSpeed:number; // The initial speed of the monster (on the X axis), after the entrance movement
    private _wingSoundKey:string; // The key for the flapping wings sound effect
    
    // This model's animation runs at a lower framerate to the game. This stores the index of the last frame that was 
    // used. See the act() method for an explanation of how this relates to the sound effect.
    private _lastAnimFrame:number;
    
    /**
     * Constructor
     * @param lavaBall1 The model of the first lava ball
     * @param lavaBall2 The model of the second lava ball
     */
    constructor(lavaBall1:LavaBall, lavaBall2:LavaBall)
    {
        super();
        
        this._lavaBalls = [lavaBall1, lavaBall2];
        
        this._wingSoundKey = "/models/monsters/BabyDragon/sounds/flap.mp3";
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
        
        const wingSound = assetHandler.loadAudio(this._wingSoundKey);
        
        this.sounds.push({
            key: this._wingSoundKey,
            asset: wingSound
        });
        this.assetsToUnload.push(this._wingSoundKey);
        
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
        
        const kernel = Kernel.getInstance();
        const level = (kernel.level as ASLevel);
        const soundEngine = kernel.soundEngine;
        
        this.actions = [
            this._move
        ];
        
        this.startY = 10,
        this.offScreenUnits = 500;
        this.startX = level.rightEdge + this.offScreenUnits;
        this.startZ = this.playerModel.z;
        
        this.x = this.startX;
        this.y = this.startY;
        this.z = this.startZ;
        
        this.state = "left";
        
        this.enterXSpeed = 90;
        this._initialXSpeed = -1000;
        this.xSpeed = this._initialXSpeed;
        
        this._lavaBalls.forEach(lb => lb.z = this.startZ);
        this._nextLavaBallIndex = 0;
        
        this._lastAnimFrame = 0;
        soundEngine.setSoundVolume(this._wingSoundKey, 1);
    }
    
    act(): void {
        super.act();
        
        const soundEngine = Kernel.getInstance().soundEngine;
        
        soundEngine.setSoundVolume(this._wingSoundKey, this.getVolumeForDistance());
        const flappingAnimation = this.animationManager.animations[this.state];
        
        // We want to run the sound effect on every wing flap.
        // The animation runs at a lower FPS to the rest of the game. We were having a buzzing sound because 
        // the animation's currentFrameIndex equaled 1 for quite a few game frames, so the sound was being 
        // repeatedly restarted. Therefore, we only want to run the sound when the animation frame has actually changed.
        const animationChangedFrame = this._lastAnimFrame !== flappingAnimation.currentFrameIndex;
        
        // The wing sound may restart too soon when changing between left/right animations.
        // Therefore, we run the sound on the last frame of the animation, not the first.
        if(animationChangedFrame && flappingAnimation.currentFrameIndex === flappingAnimation.frameCoordinates.length - 1)
            soundEngine.playSound(this._wingSoundKey);
        
        this._lastAnimFrame = flappingAnimation.currentFrameIndex;
    }
    
    //entering, exiting and resetting-----------------------------------------
    
    start(): void {
        super.start();
        Kernel.getInstance().soundEngine.forceSoundToLoad(this._wingSoundKey);
    }
    
    enter():void
    {
        const level = (Kernel.getInstance().level as ASLevel);
        
        if(level.rightEdge < (this.x + this.width))
            this.moveLeft(this.enterXSpeed);
        else
            this.entering = false;
    }
    
    exit():void
    {
        const level = (Kernel.getInstance().level as ASLevel);
        
        this.state = "left";
        this.moveLeft(this.enterXSpeed * 2);
        
        if((this.x + this.width) < (level.leftEdge - this.offScreenUnits))
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
        const isAbovePlayer = this._isAbovePlayer();
        
        if(!isAbovePlayer)
            this.moveRight(); // X speed may be a negative number, to move left
        
        this._dropBallIfTime();
        
        if(this._shouldChangeDirection(isAbovePlayer))
            this._toggleDirection();
    }
    
    /**
     * Is the dragon above the player model?
     * @returns true if the dragon is above the player model, false if not
     */
    private _isAbovePlayer():boolean
    {
        const player = this.playerModel;
        
        // We know the dragon model is wider than the player model
        return (
            (player.x >= this.x)
            && (
                (player.x + player.width) <= (this.x + this.width)
            )
        );
    }
    
    /**
     * Determines if it's time for the dragon to change direction (and generates the next time to change)
     * @param isAbovePlayer is the dragon currently above the player model?
     * @returns true if the dragon should change direction, false if not
     */
    private _shouldChangeDirection(isAbovePlayer:boolean):boolean
    {
        const player = this.playerModel;
        
        return (
            !isAbovePlayer
            && (
                (this.state === "left" && player.x > (this.x + this.width))
                || (this.state === "right" && (player.x + player.width) < this.x)
            )
        );
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
        if(this.playerModel.lost)
            return;
        
        const nextLavaBall = this._lavaBalls[this._nextLavaBallIndex];
        const altLavaBall = this._lavaBalls[this._altLavaBallIndex];
        
        const unitsWithinCameraY = Kernel.getInstance().settings.unitsWithinCameraY;
        
        const shouldTriggerInitialDrop = (!altLavaBall.active && !nextLavaBall.active && this.fireWeapon);
        const shouldTriggerRegularDrop = (
            this.fireWeapon
            && nextLavaBall.state !== "drop"
            && (altLavaBall.y > unitsWithinCameraY / 1.5)
        );
        
        if (shouldTriggerInitialDrop || shouldTriggerRegularDrop)
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