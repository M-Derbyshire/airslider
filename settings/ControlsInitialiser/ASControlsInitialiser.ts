import ControlsInitialiser from './ControlsInitialiser';
import ASModel from '../../assets/models/ASModel/ASModel';
import { CentralStateKey } from '../../assets/levels/CentralStateKey';
import Kernel from '../../Kernel/Kernel';

/**
 * The game control's initialiser class
 */
export default class ASControlsInitialiser extends ControlsInitialiser
{
    private _currentMove:string; // The name of the keyboard key that's being pressed (only ones relevant to the controls)
    
	constructor()
	{
		super();
		
        this._currentMove = "";
        
        this.initialisingFunctions = [
			this.keyboardControls.bind(this)
		];
	}
	
    keyboardControls():void
    {
        const kernel = Kernel.getInstance();
        
        const keyDownListener = (e:KeyboardEvent) => {
            if(!kernel.loadedModels.length) return;
            
            const playerModelIndex = kernel.centralState.get(CentralStateKey.PlayerModelIndex);
            const playerModel = kernel.loadedModels[playerModelIndex] as ASModel;
            
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
            if(!kernel.loadedModels.length) return;
            
            const playerModelIndex = kernel.centralState.get(CentralStateKey.PlayerModelIndex);
            const playerModel = kernel.loadedModels[playerModelIndex] as ASModel;
            
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