import IKernel from '../../../Kernel/IKernel';
import Kernel from '../../../Kernel/Kernel';
import IModelExtraEventManager from './IModelExtraEventManager';

/**
 * Manages any extra events associated with the level's models
 */
export default class ModelExtraEventManager implements IModelExtraEventManager
{
    private _kernel:IKernel;
    
    /**
     * Constructor
     */
    constructor()
    {
        this._kernel = Kernel.getInstance();
    }
    
    /**
     * Runs the check for extra events on all of the loaded models for this level
     */
    checkForEvents():void
    {
        this._kernel.loadedModels.forEach(model => model.checkForExtraEvents());
    }
}