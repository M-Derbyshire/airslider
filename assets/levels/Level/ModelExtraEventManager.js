import Kernel from '/Kernel/kernel';

/**
 * Manages any extra events associated with the level's models
 */
export default class ModelExtraEventManager
{
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
    checkForEvents()
    {
        this.kernel.loadedModels.foreach(model => model.checkForExtraEvents());
    }
}