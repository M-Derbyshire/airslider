import ControlsInitialiser from '/settings/ControlsInitialiser/ControlsInitialiser';

export default class ASControlsInitialiser extends ControlsInitialiser
{
	constructor()
	{
		super(ControlsInitialiser);
		
		this._currentMove;
		this._playerModelIndex = (!isNaN(this._kernel.settings.playerModelIndex)) ? this._kernel.settings.playerModelIndex : 0;
        this._settings = this._kernel.settings;
        
        this.initialisingFunctions = [
			this.keyboardControls.bind(this),
			this.touchControls.bind(this)
		];
	}
	
    keyboardControls() //This is for keyboard controls, for playing in browser
    {
        if(!this._settings.isOnMobile)
        {
            const keyDownListener = (e) => {
                const playerModel = this._kernel.loadedModels[this._playerModelIndex];
                
                if(this._currentMove !== e.key && playerModel.canBeControlled)
                {
                    switch(e.key)
                    {
                        case "ArrowLeft":
                            playerModel.state = "left";
                            break;
                        case "ArrowRight":
                            playerModel.state = "right";
                            break;
                    }
                    this._currentMove = e.key;
                }
            };
            
            const keyUpListener = (e) => {
                const playerModel = this._kernel.loadedModels[this._playerModelIndex];
                
                if(this._currentMove == e.key)
                {
                    playerModel.state = "forward";
                    this._currentMove = "";
                }
            };
            
            this.registeredEventListeners.push({ type: "keydown", listener: keyDownListener });
            this.registeredEventListeners.push({ type: "keyup", listener: keyUpListener });
        }
    }
    
    //these are touch controls for game on mobile
    touchControls()
    {
        const touchStartListener = (e) => {
            const playerModel = this._kernel.loadedModels[this._playerModelIndex];
            
            for(let i = 0; i < e.touches.length; i++)
            {
                if(e.touches[i].pageX < (window.innerWidth / 2) && playerModel.canBeControlled)
                {
                    playerModel.state = "left";
                    this._currentMove = "ArrowLeft";
                } else {
                    playerModel.state = "right";
                    this._currentMove = "ArrowRight";
                }
            }
        };
        
        const touchEndListener = (e) => {
            const playerModel = this._kernel.loadedModels[this._playerModelIndex];
            
            let newMove = null;
            for(let i = 0; i < e.touches.length; i++)
            {
                if(e.touches[i].pageX < (window.innerWidth / 2))
                {
                    newMove = "ArrowLeft";
                } else {
                    newMove = "ArrowRight";
                }
            }
            
            if(newMove && this._currentMove != newMove)
            {
                this._currentMove = newMove;
                
                switch(newMove)
                {
                    case "ArrowLeft":
                        playerModel.state = "left";
                        break;
                    case "ArrowRight":
                        playerModel.state = "right";
                        break;
                }
            }
            
            if(!newMove)
            {
                playerModel.state = "forward";
                this._currentMove = "";
            }
        };
        
        this.registeredEventListeners.push({ type: "touchstart", listener: touchStartListener });
        this.registeredEventListeners.push({ type: "touchend", listener: touchEndListener });
    }
};