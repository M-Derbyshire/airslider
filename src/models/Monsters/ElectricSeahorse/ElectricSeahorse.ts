import IAssetHandler from '../../../../Kernel/AssetHandler/IAssetHandler';
import Kernel from '../../../../Kernel/Kernel';
import IModelAnimationsManager from '../../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';
import ASLevel from '../../../levels/ASLevel/ASLevel';
import Monster from '../../Monster/Monster';
import Lightning from '../attacks/Lightning/Lightning';

/**
 * The Electric Seahorse monster
 */
export default class ElectricSeahorse extends Monster {

    private _leftLightningModel:Lightning; // The lightning model for the left side of the monster
    private _rightLightningModel:Lightning; // The lightning model for the right side of the monster
    private _wingSoundKey:string; // The key for the flapping wings sound effect
    private _lastAnimFrame:number; // The index of the current frame in the animation (see the act() method for explanation)
    
    /**
     * Constructor
     * @param leftLightningModel The lightning attack, for the left side
     * @param rightLightningModel The lightning attack, for the right side
     * @param modelAnimationsManager manages the animations for the model
     */
    constructor(leftLightningModel:Lightning, rightLightningModel:Lightning, modelAnimationsManager:IModelAnimationsManager)
    {
        super(modelAnimationsManager);
        
        this._leftLightningModel = leftLightningModel;
        this._rightLightningModel = rightLightningModel;
        
        this._wingSoundKey = "/models/Monsters/ElectricSeahorse/sounds/flap.mp3";
        
        this._lastAnimFrame = 0;
    }
    
    /**
     * Loads the assets for the model
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    load(assetHandler:IAssetHandler):void
    {
        super.load(assetHandler);
        
        const wingSound = assetHandler.loadAudio(this._wingSoundKey);
        
        this.sounds.push({
            key: this._wingSoundKey,
            asset: wingSound
        });
        this.assetsToUnload.push(this._wingSoundKey);
        
        const spritesheetPath = "/models/Monsters/ElectricSeahorse/anim/electricSeahorse-spritesheet.png";
        this.assetsToUnload.push(spritesheetPath);
        this.spritesheet = assetHandler.loadImage(spritesheetPath);
    }
    
    registerAnimations():void
    {
        super.registerAnimations();
        
        this.animationManager.registerAnimations({
            move: this.animationManager.createAnimation({
                spritesheet: this.spritesheet!,
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
    }
    
    prepare():void
    {
        super.prepare();
        
        const level = (Kernel.getInstance().level as ASLevel);
        
        this.actions = [
            this.move
        ];
        
        this.state = "move";
        
        this.startZ = this.playerModel?.z ?? 0;
        this.startY = 10;
        this.offScreenUnits = 500;
        this.startX = level.rightEdge + this.offScreenUnits;
        this.x = this.startX;
        this.y = this.startY;
        this.z = this.startZ;
        
        const lightningYPos = this.startY + (this.height / 1.5);
        this._leftLightningModel.y = lightningYPos;
        this._rightLightningModel.y = lightningYPos;
        this._leftLightningModel.z = this.startZ;
        this._rightLightningModel.z = this.startZ;
        this._setLightningActiveStatus(false);
        
        this.enterXSpeed = 45;
        this.xSpeed = 1100;
        
        this._lastAnimFrame = 0;
    }
    
    // Entering, exiting and reseting-----------------------------------------
    
    start(): void {
        super.start();
        Kernel.getInstance().soundEngine.forceSoundToLoad(this._wingSoundKey);
    }
    
    enter():void
    {
        const level = (Kernel.getInstance().level as ASLevel);
        
        if(level.rightEdge < (this.x + this.width))
        {
            this.moveLeft(this.enterXSpeed);
        } else {
            this.entering = false;
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
        this.moveLeft(this.enterXSpeed * 3);
        
        const level = (Kernel.getInstance().level as ASLevel);
        
        if((this.x + this.width) < (level.leftEdge - this.offScreenUnits))
        {
            this.exiting = false;
            this.active = false;
        }
    }
    
    act():void
    {
        super.act();
        
        const soundEngine = Kernel.getInstance().soundEngine;
        
        soundEngine.setSoundVolume(this._wingSoundKey, this.getVolumeForDistance());
        
        const flappingAnimation = this.animationManager.animations.move;
        
        // The animation runs at a lower FPS to the rest of the game. We were having a buzzing sound because 
        // the current animation frame equaled 1 for quite a few game frames, so was being repeatedly restarted.
        // Therefore, we only want to run the sound when the animation frame has actually changed.
        const animationChangedFrame = this._lastAnimFrame !== flappingAnimation.currentFrameIndex;
        
        if(this.state === "move" && animationChangedFrame && flappingAnimation.currentFrameIndex === 1)
            soundEngine.playSound(this._wingSoundKey);
        
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
        this.moveLeft(); // X speed can be a negative number, to move right
        this._correctLightningXPos();
        
		this._handleOverlappingOfLevelEdges();
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
        const level = (Kernel.getInstance().level as ASLevel);
        
        // Defining the left/right edges that we want the monster to stay within.
        // If we take into account the z position, these aren't actually off the screen.
        const boundaryBuffer = (this.width / 3.5);
        const leftEdgeBoundary = level.leftEdge - boundaryBuffer; 
        const rightEdgeBoundary = level.rightEdge + boundaryBuffer;
        
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
     * Sets the correct x positions for the lightning models
     */
    private _correctLightningXPos():void
    {
        this._leftLightningModel.x = this.x + 30;
        this._rightLightningModel.x = this.x + (495 - this._rightLightningModel.width);
    }
}