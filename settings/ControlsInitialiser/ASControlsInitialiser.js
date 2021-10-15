import ControlsInitialiser from '/settings/ControlsInitialiser/ControlsInitialiser';
import settings from '/settings/settings';

export default class ASControlsInitialiser extends ControlsInitialiser
{
	constructor()
	{
		super(ControlsInitialiser);
		
		this.currentMove;
		this.playerModelIndex = (!isNaN(settings.playerModelIndex)) ? settings.playerModelIndex : 0;
		
		this._initialisingFunctions = [
			this.keyboardControls.bind(this),
			this.touchControls.bind(this)
		];
	}
	
    keyboardControls() //This is for keyboard controls, for playing in browser
    {
        if(!settings.isOnMobile)
        {
            window.addEventListener("keydown", (e) => {
                // this.currentMove = e.key;
                if(this.currentMove !== e.key)
                {
                    switch(e.key)
                    {
                        case "ArrowLeft":
                            this.kernel.loadedModels[this.playerModelIndex].state = "left";
                            break;
                        case "ArrowRight":
                            this.kernel.loadedModels[this.playerModelIndex].state = "right";
                            break;
                    }
                    this.currentMove = e.key;
                }
            }, true);
            
            window.addEventListener("keyup", (e) => {
                if(this.currentMove == e.key)
                {
                    this.kernel.loadedModels[this.playerModelIndex].state = "forward";
                    this.currentMove = "";
                }
            }, true);
        }
    }
    
    //these are touch controls for game on mobile
    touchControls()
    {
        window.addEventListener("touchstart", (e) => {
            for(let i = 0; i < e.touches.length; i++)
            {
                if(e.touches[i].pageX < (window.innerWidth / 2))
                {
                    this.kernel.loadedModels[this.playerModelIndex].state = "left";
                    this.currentMove = "ArrowLeft";
                } else {
                    this.kernel.loadedModels[this.playerModelIndex].state = "right";
                    this.currentMove = "ArrowRight";
                }
            }
        }, true);
        
        window.addEventListener("touchend", (e) => {
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
                        this.kernel.loadedModels[this.playerModelIndex].state = "left";
                        break;
                    case "ArrowRight":
                        this.kernel.loadedModels[this.playerModelIndex].state = "right";
                        break;
                }
            }
            
            if(!newMove)
            {
                this.kernel.loadedModels[this.playerModelIndex].state = "forward";
                this.currentMove = "";
            }
        }, true);
    }
};