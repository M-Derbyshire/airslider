import Monster from '/assets/models/Monster/monster';

export default class ElectricSeahorse extends Monster {

    constructor(playerModel, leftLightningModel, rightLightningModel)
    {
        super(Monster);
        
        this._playerModel = playerModel;
        this._leftLightningModel = leftLightningModel;
        this._rightLightningModel = rightLightningModel;
        
        //Used when deciding when to change movement direction
        this._nextDirectionChangeMilliSeconds = 0;
    }
    
    load()
    {
        super.load();
        
        const spritesheetPath = "/assets/models/monsters/ElectricSeahorse/anim/electricSeahorse-spritesheet.png";
        
        this._assetsToUnload.push(spritesheetPath);
        
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
    
    prepare()
    {
        super.prepare();
        
        this.actions = [
            this.move
        ];
        
        this.offScreenUnits = 500;
        this.startY = 10,
        this.startX = this._levelRightEdge + this.offScreenUnits;
        
        this.startZ = this._playerModel.z;
        this.enterXSpeed = 90;
        
        this._leftLightningModel.z = this.startZ;
        this._rightLightningModel.z = this.startZ;
        
        const lightningYPos = this.startY + (this.height / 1.5);
        this._leftLightningModel.y = lightningYPos;
        this._rightLightningModel.y = lightningYPos;
        
        this.reset();
    }
    
    //entering and exiting and reseting-----------------------------------------
    
    enter()
    {
        if(this._levelRightEdge < (this.x + this.width))
        {
            this.moveLeft(this.enterXSpeed);
        } else {
            this.entering = false;
            this._nextDirectionChangeMilliSeconds = this._getNewDirectionChangeTimeMS();
            this._setLightningActiveStatus(true);
        }
    }
    
    stop()
    {
        super.stop();
        this._setLightningActiveStatus(false);
    }
    
    exit()
    {
        this.moveLeft(this.enterXSpeed * 2);
        
        if((this.x + this.width) < (this._levelLeftEdge - this.offScreenUnits))
        {
            this.exiting = false;
            this.active = false;
        }
    }
    
    reset()
    {
        this.xSpeed = 500;
        this.x = this.startX;
        this.y = this.startY;
        this.z = this.startZ;
        this.state = "move";
        this._setLightningActiveStatus(false);
    }
    
    //movement-----------------------------------------------------
    
    act()
    {
        super.act();
        
        //In case of player loss
        if(!this.fireWeapon)
            this._setLightningActiveStatus(false);
    }
    
    move()
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
    
    _handleOverlappingOfLevelEdges()
	{
        //Defining our own left/right edges we want to stay within
        //If we take into account the z position, these aren't actually off the screen
        const ourLeftEdgeBoundary = this._levelLeftEdge - (this.width / 5); 
        const ourRightEdgeBoundary = this._levelRightEdge + (this.width / 5);
        
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
    
    _getNewDirectionChangeTimeMS()
    {
        const minChangeTimeMS = 2000;
        const maxChangeTimeMS = 4000;
        
        return this.kernel._totalLevelActiveMilliseconds + (Math.random() * (maxChangeTimeMS - minChangeTimeMS)) + minChangeTimeMS;
    }
    
    _setLightningActiveStatus(isActive)
    {
        this._leftLightningModel.active = isActive;
        this._rightLightningModel.active = isActive;
    }
    
    _correctLightningXPos()
    {
        this._leftLightningModel.x = this.x + 30;
        this._rightLightningModel.x = this.x + (495 - this._rightLightningModel.width);
    }
}