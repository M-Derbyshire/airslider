import {: baseClass :} from '../{: baseClass :}/{: baseClass :}';
import IAssetHandler from '../../../Kernel/AssetHandler/IAssetHandler';
import IGraphicEngine from '../../../Kernel/engines/GraphicEngine/IGraphicEngine';

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
        
        this.sounds = [
            // Any sounds that have been loaded should be added here (as IEntitySound objects)
        ];
        
        this.assetsToUnload.push(
            // The filepaths of any assets that will need to be unloaded (when the level is unloaded) should be added here
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
     * @param graphicEngine the graphic engine for the level
     * @param canvasContext the 2D context from the HTML canvas element
     */
    draw(graphicEngine:IGraphicEngine, canvasContext:CanvasRenderingContext2D):void
    {
        super.draw(graphicEngine, canvasContext);
        
        // Do any extra drawing operations here
    }
}