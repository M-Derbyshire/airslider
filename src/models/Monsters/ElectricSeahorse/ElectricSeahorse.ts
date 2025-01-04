import Kernel from '../../../../Kernel/Kernel';
import IModelAnimationsManager from '../../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';
import Monster from '../../Monster/Monster';
import Tarian from '../../Tarian/Tarian';
import Lightning from '../attacks/Lightning/Lightning';

/**
 * The Electric Seahorse monster
 */
export default class ElectricSeahorse extends Monster {

    private _playerModel:Tarian; // The model of the player
    private _leftLightningModel:Lightning; // The lightning model for the left side of the monster
    private _rightLightningModel:Lightning; // The lightning model for the right side of the monster
    private _wingSound:HTMLAudioElement; // The sound effect for the flapping wings
    private _lastAnimFrame:number; // The index of the current frame in the animation (see the act() method for explanation)
    private _nextDirectionChangeMilliSeconds:number; // When (in milliseconds) should the monster next change direction?
    
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
        
        const assetHandler = Kernel.getInstance().assetHandler;
        
        const wingSoundPath = "/models/monsters/ElectricSeahorse/sounds/flap.mp3";
        this._wingSound = assetHandler.loadAudio(wingSoundPath);
        this.assetsToUnload.push(wingSoundPath);
        
        const spritesheetPath = "/models/monsters/ElectricSeahorse/anim/electricSeahorse-spritesheet.png";
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
        
        this.startZ = this._playerModel.z;
        this.startY = 10;
        this.offScreenUnits = 500;
        this.startX = this.levelRightEdge + this.offScreenUnits;
        this.x = this.startX;
        this.y = this.startY;
        this.z = this.startZ;
        
        const lightningYPos = this.startY + (this.height / 1.5);
        this._leftLightningModel.y = lightningYPos;
        this._rightLightningModel.y = lightningYPos;
        this._leftLightningModel.z = this.startZ;
        this._rightLightningModel.z = this.startZ;
        this._setLightningActiveStatus(false);
        
        this.enterXSpeed = 90;
        this.xSpeed = 500;
        
        this._nextDirectionChangeMilliSeconds = 0;
        this._lastAnimFrame = 0;
        this.state = "move";   
    }
    
    // Entering, exiting and reseting-----------------------------------------
    
    start(): void {
        super.start();
        Kernel.getInstance().soundEngine.forceSoundLoad(this._wingSound);
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
            Kernel.getInstance().soundEngine.playSound(this._wingSound);
        
        this._lastAnimFrame = flappingAnimation.currentFrameIndex;
        
        //In case of player loss
        if(!this.fireWeapon)
            this._setLightningActiveStatus(false);
    }
    
    /**
     * Action that moves the monster left/right
     */
    move():void
    {
        this.moveLeft(this.xSpeed); //Can be a negative number, to move right
        this._correctLightningXPos();
        
		this._handleOverlappingOfLevelEdges();
        
        //We want to change direction at random times
        const totalActiveMS = Kernel.getInstance().totalLevelActiveMilliseconds;
        if (totalActiveMS >= this._nextDirectionChangeMilliSeconds)
        {
            this.xSpeed = -this.xSpeed;
            this._nextDirectionChangeMilliSeconds = this._getNewDirectionChangeTimeMS();
        }
    }
    
    /**
     * Sets the active status of the lighting models
     * @param isActive the new active status
     */
    private _setLightningActiveStatus(isActive:boolean):void
    {
        this._leftLightningModel.active = isActive;
        this._rightLightningModel.active = isActive;
    }
    
    /**
     * Has the monster moved outside of its boundary?
     */
    private _handleOverlappingOfLevelEdges():void
	{
        // Defining the left/right edges that we want the monster to stay within.
        // If we take into account the z position, these aren't actually off the screen.
        const boundaryBuffer = (this.width / 5);
        const leftEdgeBoundary = this.levelLeftEdge - boundaryBuffer; 
        const rightEdgeBoundary = this.levelRightEdge + boundaryBuffer;
        
		const hasOverlappedLeftEdge = (this.x <= leftEdgeBoundary);
		const hasOverlappedRightEdge = (this.x + this.width >= rightEdgeBoundary);
		
        if(hasOverlappedLeftEdge || hasOverlappedRightEdge)
        {
            this.xSpeed = -this.xSpeed;
            this.x = (this.xSpeed < 0) 
                ? (leftEdgeBoundary + 1) 
                : (rightEdgeBoundary - this.width - 1);
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
        const totalActiveMS = Kernel.getInstance().totalLevelActiveMilliseconds;
        
        return totalActiveMS + (Math.random() * (maxChangeTimeMS - minChangeTimeMS)) + minChangeTimeMS;
    }
    
    /**
     * Sets the correct x positions for the lightning models
     */
    private _correctLightningXPos():void
    {
        this._leftLightningModel.x = this.x + 30;
        this._rightLightningModel.x = this.x + (495 - this._rightLightningModel.width);
    }
}