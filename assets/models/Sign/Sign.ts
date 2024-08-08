import Kernel from '../../../Kernel/Kernel';
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
     * Constructor
     * @param displayText Text to display on the sign
     * @param startPosition The starting z position of the sign (if this is null, it should be set to the vanishing point depth in prepare())
     * @param targetPosition The z position that the sign should stop moving at
     * @param active Should the sign be active initially?
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
        
        // Not adding spritesheet to assetsToUnload, as this is used by all levels
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
        
        const vanishingPointDepth = Kernel.getInstance().helpers.zCalc.vanishingPointDepth;
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
}