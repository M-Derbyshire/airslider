import ISettings from '../ISettings';
import ControlsInitialiser from './ControlsInitialiser';
import ASModel from '../../assets/models/ASModel/ASModel';

export default class ASControlsInitialiser extends ControlsInitialiser
{
    private _currentMove:string;
    private _playerModelIndex:number;
    private _settings:ISettings;
    
	constructor()
	{
		super();
		
		this._currentMove;
		this._playerModelIndex = (!isNaN(this.kernel.settings.playerModelIndex)) ? this.kernel.settings.playerModelIndex : 0;
        this._settings = this.kernel.settings;
        
        this.initialisingFunctions = [
			this.keyboardControls.bind(this),
			this.touchControls.bind(this)
		];
	}
	
    //This is for keyboard controls, for playing in browser
    keyboardControls():void
    {
        if(!this._settings.isOnMobile)
        {
            const keyDownListener = (e) => {
                const playerModel = this.kernel.loadedModels[this._playerModelIndex] as ASModel;
                
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
                const playerModel = this.kernel.loadedModels[this._playerModelIndex];
                
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
    touchControls():void
    {
        const touchStartListener = (e) => {
            const playerModel = this.kernel.loadedModels[this._playerModelIndex] as ASModel;
            
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
            const playerModel = this.kernel.loadedModels[this._playerModelIndex];
            
            let newMove:string|null = null;
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