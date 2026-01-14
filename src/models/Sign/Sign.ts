import Kernel from '../../../Kernel/Kernel';
import ASLevel from '../../levels/ASLevel/ASLevel';
import ASModel from '../ASModel/ASModel';
import IModelAnimationsManager from '../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';

/**
 * A sign on the track (e.g. the start or finish sign)
 */
export default class Sign extends ASModel 
{
    /**
     * Has this sign reached its target z position?
     */
    hasReachedTargetPosition:boolean;
    
    /**
     * The starting z position of the sign
     */
    private _startPosition:number|null;
    
    /**
     * The z position that the sign should stop moving at
     */
    private _targetPosition:number;
    
    /**
     * When this was constructed, was it set to be active?
     */
    private _initialActiveStatus:boolean;
    
    /**
     * Text to display on the sign
     */
    private _textToDisplay:string;
    
    /**
     * An image to be drawn at the bases of the sign (one on each side)
     */
    private _baseImage:HTMLImageElement;
    
    /**
     * The width to use when drawing the base image
     */
    private _baseImageWidth:number;
    
    /**
     * The height to use when drawing the base image
     */
    private _baseImageHeight:number;
    
    /**
     * Constructor
     * @param modelAnimationsManager manages the animations for the model
     * @param displayText Text to display on the sign
     * @param startPosition The starting z position of the sign (if this is null, it should be set to the vanishing point depth in prepare())
     * @param targetPosition The z position that the sign should stop moving at
     * @param active Should the sign be active initially?
     */
    constructor(
        modelAnimationsManager:IModelAnimationsManager,
        displayText:string,
        startPosition:number|null,
        targetPosition:number,
        active:boolean
    )
    {
        super(modelAnimationsManager);
        
        this._textToDisplay = displayText;
        
        this._startPosition = startPosition;
        this._targetPosition = targetPosition;
        
        this._initialActiveStatus = active;
    }
    
    load():void
    {
        super.load();
        
        const assetHandler = Kernel.getInstance().assetHandler;
        
        const spritesheetPath = "/models/Sign/anim/sign_spritesheet.png";
        this.spritesheet = assetHandler.loadImage(spritesheetPath);
        
        // Not adding spritesheet to assetsToUnload, as this is used by all levels
        this.animationManager.registerAnimations({
            sign: this.animationManager.createAnimation({
                spritesheet: this.spritesheet,
                frameCoordinates: [
                    { x: 0, y: 0, width: 1356, height: 676 }
                ],
                fps: 1,
                drawWidth: 1200,
                drawHeight: 1000,
            })
        });
    }
    
    prepare():void
    {
        super.prepare();
        
        const vanishingPointDepth = (Kernel.getInstance().level as ASLevel).vanishingPointDepth;
        if(this._startPosition === null)
            this._startPosition = vanishingPointDepth;
        
        this.x = -100;
        this.y = 0;
        this.z = this._startPosition;
        
        this.active = this._initialActiveStatus;
        this.hasReachedTargetPosition = false;
        this.zSpeed = 0;
        
        this.state = "sign";
        
        this.text = {
            content: this._textToDisplay,
            x: 460,
            y: 145,
            size: 150,
            font: "CourierPrime",
            color: "white",
            style: "normal",
            alignment: "left",
            lineGap: 0
        };
    }
    
    act():void
    {
        if (!this.hasReachedTargetPosition) 
        {
            this._setZSpeedBasedOnLevelSpeed();
            this.z -= this.zSpeed; // the level has already calculated this, so not using this.moveOut()
        }
        
        this._checkForTargetPosition();
        
        if(this.z < 0)
            this.active = false;
    }
    
    draw():void
    {
        super.draw();
        
        if(this._baseImage) {
            this._drawBaseImageOnLeft();
            this._drawBaseImageOnRight();
        }
    }
    
    /**
     * Sets the image to be drawn at the bases of the sign (one on each side)
     * @param image the image to be drawn
     * @param width the width to draw the image with
     * @param height the height to draw the image with
     */
    setBaseImage(image:HTMLImageElement, width:number, height:number):void
    {
        this._baseImage = image;
        this._baseImageWidth = width;
        this._baseImageHeight = height;
    }
    
    /**
     * Checks to see if the sign is in its target position, and sets hasReachedTargetPosition to true
     */
    private _checkForTargetPosition():void
    {
        if(this.z <= this._targetPosition)
        {
            this.z = this._targetPosition;
            this.hasReachedTargetPosition = true;
        }
    }
    
    /**
     * Updates the speed of the sign, based on the level speed
     */
    private _setZSpeedBasedOnLevelSpeed():void
	{
        const level = Kernel.getInstance().level as ASLevel;
        
		if(level.levelMoving)
            this.zSpeed = level.levelSpeed;
	}
    
    /**
     * Draws the base image on the left-side base of the sign
     */
    private _drawBaseImageOnLeft():void
    {
        const signHalfWidth = this._baseImageWidth / 2;
        const mountPosition = this.x + 30;
        
        const imageXPosition = mountPosition - signHalfWidth;
        
        this._drawBaseImage(imageXPosition);
    }
    
    /**
     * Draws the base image on the right-side base of the sign
     */
    private _drawBaseImageOnRight():void
    {
        const signHalfWidth = this._baseImageWidth / 2;
        const mountPosition = (this.x + this.width) - 30;
        
        const imageXPosition = mountPosition - signHalfWidth;
        
        this._drawBaseImage(imageXPosition);
    }
    
    /**
     * Draws a base image (taking into account the Z-axis position of the sign)
     * @param x the X-axis position to draw the image at
     */
    private _drawBaseImage(x:number):void
    {
        const kernel = Kernel.getInstance();
        
        const signBottom = this.y + this.height;
        const extraY = 17;
        
        const imageYPosition = (signBottom - this._baseImageHeight) + extraY;
        
        const scaledDrawValues = kernel.graphicEngine.getScaledDrawPositionsAndDimensions({
			x,
			y: imageYPosition,
			width: this._baseImageWidth,
			height: this._baseImageHeight,
			z: this.z
		});
        
        kernel.canvasContext.drawImage(
            this._baseImage,
            scaledDrawValues.x,
            scaledDrawValues.y,
            scaledDrawValues.width,
            scaledDrawValues.height
        );
    }
}