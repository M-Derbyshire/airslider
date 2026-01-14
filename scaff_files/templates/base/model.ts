import Model from '../../../Kernel/entities/Model/Model';
import IModelAnimationsManager from '../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';

/**
 * A base Model class
 */
export default class {: name :} extends Model
{
    /**
     * Constructor
     * @param modelAnimationsManager manages the animations for the model
     */
    constructor(modelAnimationsManager:IModelAnimationsManager)
	{
		super(modelAnimationsManager);
        
		// Handle construction here
	}
    
    /**
     * Loads the assets for the model
     */
    load():void 
    {
        super.load()
        
        // Handle loading any assets here
        
        this.assetsToUnload.push(
            // Any assets that need to be unloaded (when the level is unloaded) should be added here
        );
    }
    
    /**
     * Prepares the model, before the gameplay of the level starts
     */
    prepare():void
    {
        super.prepare();
        
        // Set anything that will need setting/resetting when the level starts/restarts
    }
    
    /**
     * Runs the model's actions. This is ran on every frame.
     */
    act():void
    {
        super.act();
        
        // Here you can trigger any actions that need to happen on every frame
    }
    
    /**
     * Runs any extra event checks specific to this model
     */
    checkForExtraEvents():void
    {
        super.checkForExtraEvents();
        
        // Check for (and handle) any extra events that could happen on every model
    }
};