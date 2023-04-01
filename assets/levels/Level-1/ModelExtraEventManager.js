import Kernel from '/kernel/kernel';

export default class ModelExtraEventManager
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
    }
    
    checkForEvents()
    {
        //loadedModels is a collection, so no foreach method
        for(let i = 0; i < this.kernel.loadedModels.length; i++)
        {
            this.kernel.loadedModels[i].checkForExtraEvents();
        }
    }
}