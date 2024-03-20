import Model from '../Model/Model';
import IModelAnimationsManager from '../Model/ModelAnimationsManager/IModelAnimationsManager';

/**
 * A base Model class
 */
export default class {: name :} extends Model
{
    constructor()
	{
		super();
        
		// Handle construction here
	}
    
    /**
     * Loads everything for the model 
     * @param animationManager The animation manager for the model
     */
    load(animationManager:IModelAnimationsManager):void 
    {
        super.load(animationManager)
        
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
     * Any extra event checks relevant to all models
     */
    protected extraEvents():void
    {
        super.extraEvents();
        
        // Check for (and handle) any extra events that could happen on every model
    }
};