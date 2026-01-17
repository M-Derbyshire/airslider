import HUDComponent from '../../../Kernel/entities/HUDComponent/HUDComponent';
import IAssetHandler from '../../../Kernel/AssetHandler/IAssetHandler';
import ISoundEngine from '../../../Kernel/engines/SoundEngine/ISoundEngine';
import IGraphicEngine from '../../../Kernel/engines/GraphicEngine/IGraphicEngine';

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
     * @param soundEngine the sound engine for the level
     */
    prepare(soundEngine:ISoundEngine):void
    {
        super.prepare(soundEngine);
        
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