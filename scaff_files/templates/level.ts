import {: baseClass :} from '../{: baseClass :}/{: baseClass :}';
import IFrameManager from '../../../Kernel/engines/GraphicEngine/IFrameManager';
import IModelEventManager from '../../../Kernel/entities/Level/IModelEventManager';
import IPointerEventManager from '../../../Kernel/entities/Level/IPointerEventManager';
import IKeyboardEventManager from '../../../Kernel/entities/Level/IKeyboardEventManager';
import IModel from '../../../Kernel/entities/Model/IModel';
import IAssetHandler from '../../../Kernel/AssetHandler/IAssetHandler';
import ISoundEngine from '../../../Kernel/engines/SoundEngine/ISoundEngine';
import ICamera from '../../../Kernel/engines/GraphicEngine/ICamera';

/**
 * A class for a Level
 */
export default class {: name :} extends {: baseClass :}
{
    /**
     * Constructor
     * @param frameManager The frame manager for the level
     * @param modelEventManager Manages the event monitoring between models
     * @param pointerEventManager Manages any events relating to mouse clicks or screen touches
     * @param keyboardEventManager Manages any keyboard events
     */
    constructor(
        frameManager:IFrameManager,
        modelEventManager:IModelEventManager,
        pointerEventManager:IPointerEventManager,
        keyboardEventManager:IKeyboardEventManager
    )
	{
		super(frameManager, modelEventManager, pointerEventManager, keyboardEventManager);
        
        // Handle construction here
	}
    
    /**
     * Creates and returns the models to be used in the level
     * @returns the newly created models
     */
    getModels():IModel[]
    {
        const superModels = super.getModels();
        
        // Create any models needed for the level here
        
        return [
            ...superModels,
            // Put your created models here
        ];
    }
    
    /**
     * Loads the level's assets
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
     * Prepares the level, before the gameplay starts
     * @param soundEngine the sound engine for the level
     * @param camera the camera for the level
     */
    prepare(soundEngine:ISoundEngine, camera:ICamera):void
    {
        super.prepare(soundEngine, camera);
        
        // Set anything that will need setting/resetting when a level starts/restarts
    }
    
    /**
     * Runs the level's actions.
     */
    act():void
    {
        super.act();
        
        // Here you can trigger any actions that need to happen on every frame
    }
    
    /**
     * Draws anything that needs to be in the back (before the models) of the level
     */
    drawBack():void
    {
        super.drawBack();
        
        // Draw anything that should be in the back of the level (behind the models)
    }
    
    /**
     * Draws anything that needs to be in the front (over the models) of the level
     */
    drawFront():void
    {
        super.drawFront();
        
        // Draw anything that should be in the front of the level (over the models)
    }
    
    /**
     * Registers model events for the level
     */
	protected registerLevelEvents():void
	{
        super.registerLevelEvents();
        
        this.modelEventManager.registerEventsArray([
            // Register any model events here (e.g. collisions)
        ]);
	}
};