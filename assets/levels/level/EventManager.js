class EventManager
{
    constructor(eventCheckContainer, modelExtraEventManager)
    {
        this.kernel = Kernel.getInstance();
        
        this._eventCheckContainer = eventCheckContainer;
        this._modelExtraEventManager = modelExtraEventManager;
        
        //This will be an array of objects. Each object has these attributes:
        // eventCheckMethodName; class1ModelIndexes; class1EventActionName;
        // class2ModelIndexes; class2EventActionName.
        this._events = [];
    }
    
    registerEvent(eventCheckMethodName, class1, class1EventActionName, class2, class2EventActionName)
    {
        const class1ModelIndexes = [];
        const class2ModelIndexes = [];
        
        //LoadedModels is a collection, so can't use foreach
        for(let i = 0; i < this.kernel.loadedModels.length; i++)
        {
            if(this.kernel.loadedModels[i] instanceof class1) class1ModelIndexes.push(i);
            if(this.kernel.loadedModels[i] instanceof class2) class2ModelIndexes.push(i);
        }
        
        this._events.push({ 
            eventCheckMethodName, 
            class1ModelIndexes, 
            class1EventActionName, 
            class2ModelIndexes, 
            class2EventActionName 
        });
    }
    
    //The events parameter will be an array of event objects, that each contain the parameters required
    //by the registerEvent method. The object property names are: "eventCheckMethodName", "class1", 
    //"class1EventActionName", "class2", and "class2EventActionName".
    registerEventsArray(events)
    {
        events.forEach(e => {
            this.registerEvent(e.eventCheckMethodName, e.class1, e.class1EventActionName, e.class2,
                e.class2EventActionName);
        });
    }
    
    checkForEvents()
    {
        //For each event, go through the models for class1, and then
        //check them against each model for class2.
        this._events.forEach((event) => {
            
            event.class1ModelIndexes.forEach((modelIndex1) => {
                
                event.class2ModelIndexes.forEach((modelIndex2) => {
                    
                    this._eventCheckContainer[event.eventCheckMethodName](
                        this.kernel.loadedModels[modelIndex1], 
                        event.class1EventActionName, 
                        this.kernel.loadedModels[modelIndex2],
                        event.class2EventActionName
                    );
                    
                });
                
            });
        });
        
        this.checkForExtraModelEvents();
    }
    
    checkForExtraModelEvents()
    {
        this._modelExtraEventManager.checkForEvents();
    }
}