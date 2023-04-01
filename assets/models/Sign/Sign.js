import ASModel from '/assets/models/ASModel/ASModel';

export default class Sign extends ASModel 
{
    constructor(displayText, startPosition, targetPosition, active)
    {
        super(ASModel);
        
        this._text = {
            text: displayText,
            x: 460,
            y: 145,
            size: 150,
            font: "Mechanical",
            color: "white",
            style: "normal",
        };
        
        this.hasReachedTargetPosition = false;
        this._startPosition = startPosition;
        this._targetPosition = targetPosition;
        
        this.active = active;
    }
    
    load()
    {
        super.load();
        
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
    
    prepare()
    {
        super.prepare();
        this.x = -100;
        this.y = 0;
        this.z = this._startPosition;
        this.zSpeed = 0;
        this.state = "sign";
        this.hasReachedTargetPosition = false;
    }
    
    act()
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
    
    _checkForTargetPosition()
    {
        if(this.z <= this._targetPosition)
        {
            this.z = this._targetPosition;
            this.hasReachedTargetPosition = true;
        }
    }
    
    _setZSpeedBasedOnLevelSpeed()
	{
		if(this.kernel.level.levelMoving)
        {
            this.zSpeed = this.kernel.level.levelSpeed;
        }
	}
}