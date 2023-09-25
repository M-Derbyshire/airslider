import IBoundaryBox from '../../Model/IBoundaryBox';
import IModelAnimationsManager from '../../Model/ModelAnimationsManager/IModelAnimationsManager';
import Monster from '../../Monster/Monster';
import Tarian from '../../Tarian/Tarian';
import Lightning from '../attacks/Lightning/Lightning';

/**
 * The Electric Seahorse monster
 */
export default class ElectricSeahorse extends Monster {

    private _playerModel:Tarian;
    private _leftLightningModel:Lightning;
    private _rightLightningModel:Lightning;
    private _wingSound:HTMLAudioElement;
    private _lastAnimFrame:number;
    
    private _nextDirectionChangeMilliSeconds:number; // Used when deciding when to change movement direction
    
    /**
     * Constructor
     * @param playerModel The model of the player
     * @param leftLightningModel The lightning attack, for the left side
     * @param rightLightningModel The lightning attack, for the right side
     */
    constructor(playerModel:Tarian, leftLightningModel:Lightning, rightLightningModel:Lightning)
    {
        super();
        
        this._playerModel = playerModel;
        this._leftLightningModel = leftLightningModel;
        this._rightLightningModel = rightLightningModel;
    }
    
    load(animationManager:IModelAnimationsManager):void
    {
        super.load(animationManager);
        
        const wingSoundPath = "/assets/models/monsters/ElectricSeahorse/sounds/flap.mp3";
        this._wingSound = this.kernel.loadAudio(wingSoundPath);
        this.assetsToUnload.push(wingSoundPath);
        
        const spritesheetPath = "/assets/models/monsters/ElectricSeahorse/anim/electricSeahorse-spritesheet.png";
        this.assetsToUnload.push(spritesheetPath);
        
        this.animationManager.registerAnimations({
            move: this.animationManager.createAnimation({
                sheetPath: spritesheetPath,
                fps: 12,
                drawWidth: 500,
                drawHeight: 187,
				frameCoordinates: [
					{ x: 0, y: 0, width: 688, height: 187 },
					{ x: 0, y: 188, width: 688, height: 187 },
					{ x: 0, y: 378, width: 688, height: 187 },
                    { x: 0, y: 188, width: 688, height: 187 }
				]
            })
        });
        
        this.state = "move";
    }
    
    prepare():void
    {
        super.prepare();
        
        this.actions = [
            this.move
        ];
        
        this.offScreenUnits = 500;
        this.startY = 10,
        this.startX = this.levelRightEdge + this.offScreenUnits;
        
        this.startZ = this._playerModel.z;
        this.enterXSpeed = 90;
        
        this._leftLightningModel.z = this.startZ;
        this._rightLightningModel.z = this.startZ;
        
        const lightningYPos = this.startY + (this.height / 1.5);
        this._leftLightningModel.y = lightningYPos;
        this._rightLightningModel.y = lightningYPos;
        
        this._lastAnimFrame = 0;
        
        this._nextDirectionChangeMilliSeconds = 0;
        this.xSpeed = 500;
        this.x = this.startX;
        this.y = this.startY;
        this.z = this.startZ;
        this.state = "move";
        this._setLightningActiveStatus(false);
    }
    
    getBoundaryBoxes():IBoundaryBox[]
    {
        return [];
    }
    
    //entering and exiting and reseting-----------------------------------------
    
    start(): void {
        super.start();
        
        this.kernel.soundEn.forceLoad(this._wingSound);
    }
    
    enter():void
    {
        if(this.levelRightEdge < (this.x + this.width))
        {
            this.moveLeft(this.enterXSpeed);
        } else {
            this.entering = false;
            this._nextDirectionChangeMilliSeconds = this._getNewDirectionChangeTimeMS();
            this._setLightningActiveStatus(true);
        }
    }
    
    stop():void
    {
        super.stop();
        this._setLightningActiveStatus(false);
    }
    
    exit():void
    {
        this.moveLeft(this.enterXSpeed * 2);
        
        if((this.x + this.width) < (this.levelLeftEdge - this.offScreenUnits))
        {
            this.exiting = false;
            this.active = false;
        }
    }
    
    //movement-----------------------------------------------------
    
    act():void
    {
        super.act();
        
        // Wing flap sound effect
        this._wingSound.volume = this.getVolumeForDistance();
        const flappingAnimation = this.animationManager.animations.move;
        
        // The animation runs at a lower FPS to the rest of the game. We were having a buzzing sound because 
        // the current animation frame equaled 1 for quite a few game frames, so was being repeatedly restarted.
        // Therefore, we only want to run the sound when the animation frame has actually changed.
        const animationChangedFrame = this._lastAnimFrame !== flappingAnimation.currentFrameIndex;
        
        if(this.state === "move" && animationChangedFrame && flappingAnimation.currentFrameIndex === 1)
        {
            this.kernel.soundEn.playSound(this._wingSound);
        }
        
        this._lastAnimFrame = flappingAnimation.currentFrameIndex;
        
        //In case of player loss
        if(!this.fireWeapon)
            this._setLightningActiveStatus(false);
    }
    
    /**
     * Moves the monster left/right
     */
    move():void
    {
        this.moveLeft(this.xSpeed); //Can be negative, and so move right
        this._correctLightningXPos();
        
		this._handleOverlappingOfLevelEdges();
        
        //We want to change direction at random times
        if (this.kernel.totalLevelActiveMilliseconds >= this._nextDirectionChangeMilliSeconds)
        {
            this.xSpeed = -this.xSpeed;
            this._nextDirectionChangeMilliSeconds = this._getNewDirectionChangeTimeMS();
        }
    }
    
    /**
     * Has the monster moved outside of its boundary
     */
    private _handleOverlappingOfLevelEdges():void
	{
        //Defining our own left/right edges we want to stay within
        //If we take into account the z position, these aren't actually off the screen
        const ourLeftEdgeBoundary = this.levelLeftEdge - (this.width / 5); 
        const ourRightEdgeBoundary = this.levelRightEdge + (this.width / 5);
        
		const hasOverlappedLeftEdge = (this.x <= ourLeftEdgeBoundary);
		const hasOverlappedRightEdge = (this.x + this.width >= ourRightEdgeBoundary);
		
        if(hasOverlappedLeftEdge || hasOverlappedRightEdge)
        {
            this.xSpeed = -this.xSpeed;
            this.x = (this.xSpeed < 0) 
                ? (ourLeftEdgeBoundary + 1) 
                : (ourRightEdgeBoundary - this.width - 1);
        }
	}
    
    /**
     * Gets a new time (in milliseconds) to change the direction of the monster. When this time is reached, 
     * the monster can change direction again
     * @returns a new time (in milliseconds)
     */
    private _getNewDirectionChangeTimeMS():number
    {
        const minChangeTimeMS = 2000;
        const maxChangeTimeMS = 4000;
        
        return this.kernel.totalLevelActiveMilliseconds + (Math.random() * (maxChangeTimeMS - minChangeTimeMS)) + minChangeTimeMS;
    }
    
    /**
     * Sets the active status of the lighting
     * @param isActive the new active status
     */
    _setLightningActiveStatus(isActive:boolean):void
    {
        this._leftLightningModel.active = isActive;
        this._rightLightningModel.active = isActive;
    }
    
    /**
     * Sets the correct x positions of the lightning
     */
    _correctLightningXPos():void
    {
        this._leftLightningModel.x = this.x + 30;
        this._rightLightningModel.x = this.x + (495 - this._rightLightningModel.width);
    }
}