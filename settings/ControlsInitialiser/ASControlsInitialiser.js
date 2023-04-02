import ControlsInitialiser from '/settings/ControlsInitialiser/ControlsInitialiser';

export default class ASControlsInitialiser extends ControlsInitialiser
{
	constructor()
	{
		super(ControlsInitialiser);
		
		this.currentMove;
		this.playerModelIndex = (!isNaN(this.kernel.settings.playerModelIndex)) ? this.kernel.settings.playerModelIndex : 0;
		
		this._initialisingFunctions = [
			this.keyboardControls.bind(this),
			this.touchControls.bind(this)
		];
        
        this._settings = this.kernel.settings;
	}
	
    keyboardControls() //This is for keyboard controls, for playing in browser
    {
        if(!this._settings.isOnMobile)
        {
            const keyDownListener = (e) => {
                const playerModel = this.kernel.loadedModels[this.playerModelIndex];
                
                if(this.currentMove !== e.key && playerModel.canBeControlled)
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
                    this.currentMove = e.key;
                }
            };
            
            const keyUpListener = (e) => {
                const playerModel = this.kernel.loadedModels[this.playerModelIndex];
                
                if(this.currentMove == e.key)
                {
                    playerModel.state = "forward";
                    this.currentMove = "";
                }
            };
            
            this._registeredEventListeners.push({ type: "keydown", listener: keyDownListener, options: true });
            this._registeredEventListeners.push({ type: "keyup", listener: keyUpListener, options: true });
        }
    }
    
    //these are touch controls for game on mobile
    touchControls()
    {
        const touchStartListener = (e) => {
            const playerModel = this.kernel.loadedModels[this.playerModelIndex];
            
            for(let i = 0; i < e.touches.length; i++)
            {
                if(e.touches[i].pageX < (window.innerWidth / 2) && playerModel.canBeControlled)
                {
                    playerModel.state = "left";
                    this.currentMove = "ArrowLeft";
                } else {
                    playerModel.state = "right";
                    this.currentMove = "ArrowRight";
                }
            }
        };
        
        const touchEndListener = (e) => {
            const playerModel = this.kernel.loadedModels[this.playerModelIndex];
            
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
            
            if(newMove && this.currentMove != newMove)
            {
                this.currentMove = newMove;
                
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
                this.currentMove = "";
            }
        };
        
        this._registeredEventListeners.push({ type: "touchstart", listener: touchStartListener, options: true });
        this._registeredEventListeners.push({ type: "touchend", listener: touchEndListener, options: true });
    }
};