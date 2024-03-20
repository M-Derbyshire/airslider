import Level from '../Level/Level';
import IFrameManager from '../../../engines/GraphicEngine/IFrameManager';
import EventManager from '../Level/EventManager';
import PointerEventManager from '../Level/PointerEventManager';
import IModel from '../../models/Model/IModel';

/**
 * A base Level class
 */
export default class {: name :} extends Level
{
    constructor()
	{
		super();
        
        // Handle construction here
	}
    
    /**
     * Creates and returns the models to be used in the level
     * @returns the newly created models
     */
    getModels():IModel[]
    {
        const superModels = super.getModels();
        
        // Create any models needed for all levels here
        
        return [
            ...superModels,
            // Put your created models here
        ];
    }
    
    /**
     * Loads and sets up the level
     * @param frameManager The frame manager for the level
     * @param eventManager Manages the event monitoring for a level
     * @param pointerEventManager Manages any events relating to mouse clicks or screen touches
     */
	load(
        frameManager:IFrameManager,
        eventManager:EventManager,
        pointerEventManager:PointerEventManager
    ):void
	{
		super.load(frameManager, eventManager, pointerEventManager);
        
        // Handle loading any assets here
        
        this.assetsToUnload.push(
            // Any assets that need to be unloaded (when the level is unloaded) should be added here
        );
	}
    
    /**
     * Prepares the level, before the gameplay starts
     */
    prepare():void
    {
        super.prepare();
        
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
        
		//These are the events that are valid across all levels
        this.eventManager.registerEventsArray([
            // Register any model events here (e.g. collisions)
        ]);
	}
};