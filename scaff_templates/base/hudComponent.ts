import HUDComponent from '../../../Kernel/entities/HUDComponent/HUDComponent';

/**
 * A base HUDComponent class
 */
export default class {: name :} extends HUDComponent 
{	
	constructor()
	{
		super();
        
        // Handle construction here
	}
    
    /**
     * Loads the component
     */
    load():void 
    {
        super.load();
        
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