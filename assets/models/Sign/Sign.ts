import ASLevel from '../../levels/ASLevel/ASLevel';
import ASModel from '../ASModel/ASModel';
import IModelAnimationsManager from '../Model/ModelAnimationsManager/IModelAnimationsManager';

/**
 * A sign on the track (e.g. the start or finish sign)
 */
export default class Sign extends ASModel 
{
    /**
     * Has this sign reached its target z position?
     */
    hasReachedTargetPosition:boolean;
    
    private _startPosition:number;
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
     * Constructor
     * @param displayText Text to display on the sign
     * @param startPosition The starting z position of the sign (if this is null, it will be set to the vanishing point depth)
     * @param targetPosition The z position that the sign should stop moving at
     * @param active Is the sign active initially?
     */
    constructor(displayText:string, startPosition:number|null, targetPosition:number, active:boolean)
    {
        super();
        
        this._textToDisplay = displayText;
        
        this._startPosition = startPosition;
        this._targetPosition = targetPosition;
        
        this._initialActiveStatus = active;
    }
    
    load(animationManager:IModelAnimationsManager):void
    {
        super.load(animationManager);
        
        this.animationManager.registerAnimations({
            sign: this.animationManager.createAnimation({
                sheetPath: "/assets/models/Sign/anim/sign_spritesheet.png",
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
        
        if(this._startPosition === null)
            this._startPosition = this.helpers.zCalc.vPointDepth;
        
        this.x = -100;
        this.y = 0;
        this.z = this._startPosition;
        this.zSpeed = 0;
        this.state = "sign";
        this.hasReachedTargetPosition = false;
        this.active = this._initialActiveStatus;
        
        this.text = {
            content: this._textToDisplay,
            x: 460,
            y: 145,
            size: 150,
            font: "Mechanical",
            color: "white",
            style: "normal",
        };
    }
    
    act():void
    {
        if (!this.hasReachedTargetPosition) 
        {
            this._setZSpeedBasedOnLevelSpeed();
            this.z -= this.zSpeed; // Level has already calculated this, so not using this.moveOut()
        }
        
        this._checkForTargetPosition();
        
        if(this.z < 0)
            this.active = false;
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
		if((this.kernel.level as ASLevel).levelMoving)
        {
            this.zSpeed = (this.kernel.level as ASLevel).levelSpeed;
        }
	}
}