import {: baseClass :} from '../{: baseClass :}/{: baseClass :}';
import IAssetHandler from '../../../Kernel/AssetHandler/IAssetHandler';

/**
 * A class for a HUDComponent
 */
export default class {: name :} extends {: baseClass :} 
{	
	constructor()
	{
		super();
        
        // Handle construction here
	}
    
    /**
     * Loads the component
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    load(assetHandler:IAssetHandler):void 
    {
        super.load(assetHandler);
        
        // Handle loading any assets here
        
        this.assetsToUnload.push(
            // Any assets that need to be unloaded (when the level is unloaded) should be added here
        );
    }
    
    /**
     * Prepares the component before the level starts
     */
    prepare():void 
    {
        super.prepare();
        
        // Set anything that will need setting/resetting when a level starts/restarts
    }
    
    /**
     * Draws the component
     */
    draw():void 
    {
        super.draw();
        
        // Do any extra drawing operations here
    }
}