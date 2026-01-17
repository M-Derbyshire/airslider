import {: baseClass :} from '../{: baseClass :}/{: baseClass :}';
import IModelAnimationsManager from '../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';
import IAssetHandler from '../../../Kernel/AssetHandler/IAssetHandler';

/**
 * A class for a Model
 */
export default class {: name :} extends {: baseClass :}
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
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    load(assetHandler:IAssetHandler):void
    {
        super.load(assetHandler);
        
        // Handle loading any assets here, using the assetHandler
        
        this.assetsToUnload.push(
            // Any assets that need to be unloaded (when the level is unloaded) should be added here
        );
    }
    
    /**
     * Registers the animations for the model
     */
    registerAnimations():void
    {
        super.registerAnimations();
        
        // Register any model animations here, using the this.animationManager.registerAnimations method
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
        
        // Check for (and handle) any extra events that could happen on the model
    }
};