import Kernel from '/Kernel/kernel';

/**
 * Manages the event monitoring for a level
 */
export default class EventManager
{
    /**
     * Constructor
     * @param eventCheckContainer An instance of the EventCheckContainer (which contains custom methods that will check for events)
     * @param modelExtraEventManager Manages any extra events associated with the level's models
     */
    constructor(eventCheckContainer, modelExtraEventManager)
    {
        this._kernel = Kernel.getInstance();
        
        this._eventCheckContainer = eventCheckContainer;
        this._modelExtraEventManager = modelExtraEventManager;
        
        //This will be an array of objects. Each object has these attributes:
        // eventCheckMethodName; class1Models; class1EventActionName;
        // class2Models; class2EventActionName.
        this._events:IEvent[] = [];
    }
    
    /**
     * Registers a new event check. All models that are instances of the 2 given classes will be collected. When the 
     * event check is ran, each model of the first class will be checked against each model of the second class, to see 
     * if the event has occurred between them.
     * @param event The details of an event to be registered
     */
    registerEvent(event:IEventDetails)
    {
        const class1Models = [];
        const class2Models = [];
        
        //LoadedModels is a collection, so can't use foreach
        for(let i = 0; i < this._kernel.loadedModels.length; i++)
        {
            if(this._kernel.loadedModels[i] instanceof event.class1) class1Models.push(this._kernel.loadedModels[i]);
            if(this._kernel.loadedModels[i] instanceof event.class2) class2Models.push(this._kernel.loadedModels[i]);
        }
        
        this._events.push({ 
            eventCheckMethodName: event.eventCheckMethodName, 
            class1Models, 
            class1EventActionName: event.class1EventActionName, 
            class2Models, 
            class2EventActionName: event.class2EventActionName 
        });
    }
    
    /**
     * Registers multiple event checks. See registerEvent method for more details
     * @param events The details of the events to be registered
     */
    registerEventsArray(events:IEventDetails[])
    {
        events.forEach(e => {
            this.registerEvent(e.eventCheckMethodName, e.class1, e.class1EventActionName, e.class2,
                e.class2EventActionName);
        });
    }
    
    /**
     * Runs the event checks, along with any extra events associated with the level's models
     */
    checkForEvents()
    {
        //For each event, go through the models for class1, and then
        //check them against each model for class2.
        this._events.forEach((event) => {
            
            event.class1Models.forEach((model1) => {
                
                event.class2Models.forEach((model2) => {
                    
                    this._eventCheckContainer[event.eventCheckMethodName](
                        model1, 
                        event.class1EventActionName, 
                        model2,
                        event.class2EventActionName
                    );
                    
                });
                
            });
        });
        
        this._checkForExtraModelEvents();
    }
    
    /**
     * Runs any extra events associated with the level's models
     */
    _checkForExtraModelEvents()
    {
        this._modelExtraEventManager.checkForEvents();
    }
}