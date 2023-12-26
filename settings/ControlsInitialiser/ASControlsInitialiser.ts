import ISettings from '../ISettings';
import ControlsInitialiser from './ControlsInitialiser';
import ASModel from '../../assets/models/ASModel/ASModel';

/**
 * The game control's initialiser class
 */
export default class ASControlsInitialiser extends ControlsInitialiser
{
    private _currentMove:string; // The name of the keyboard key that's being pressed (only ones relevant to the controls)
    private _playerModelIndex:number; // The index of the player model in the kernel.loadedModels array
    private _settings:ISettings; // The game's settings
    
	constructor()
	{
		super();
		
        this._currentMove = "";
        this._settings = this.kernel.settings;
		this._playerModelIndex = (!isNaN(this._settings.playerModelIndex)) ? this._settings.playerModelIndex : 0;
        
        this.initialisingFunctions = [
			this.keyboardControls.bind(this)
		];
	}
	
    keyboardControls():void
    {
        const keyDownListener = (e:KeyboardEvent) => {
            const playerModel = this.kernel.loadedModels[this._playerModelIndex] as ASModel;
            
            if(playerModel.canBeControlled && this._currentMove !== e.key)
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
        
        const keyUpListener = (e:KeyboardEvent) => {
            const playerModel = this.kernel.loadedModels[this._playerModelIndex] as ASModel;
            
            if(playerModel.canBeControlled && this._currentMove === e.key)
            {
                playerModel.state = "forward";
                this._currentMove = "";
            }
        };
        
        this.registeredEventListeners.push({ type: "keydown", listener: keyDownListener });
        this.registeredEventListeners.push({ type: "keyup", listener: keyUpListener });
    }
};