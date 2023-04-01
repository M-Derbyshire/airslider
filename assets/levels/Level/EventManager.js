import Kernel from '/Kernel/kernel';

export default class EventManager
{
    constructor(eventCheckContainer, modelExtraEventManager)
    {
        this.kernel = Kernel.getInstance();
        
        this._eventCheckContainer = eventCheckContainer;
        this._modelExtraEventManager = modelExtraEventManager;
        
        //This will be an array of objects. Each object has these attributes:
        // eventCheckMethodName; class1Models; class1EventActionName;
        // class2Models; class2EventActionName.
        this._events = [];
    }
    
    registerEvent(eventCheckMethodName, class1, class1EventActionName, class2, class2EventActionName)
    {
        const class1Models = [];
        const class2Models = [];
        
        //LoadedModels is a collection, so can't use foreach
        for(let i = 0; i < this.kernel.loadedModels.length; i++)
        {
            if(this.kernel.loadedModels[i] instanceof class1) class1Models.push(this.kernel.loadedModels[i]);
            if(this.kernel.loadedModels[i] instanceof class2) class2Models.push(this.kernel.loadedModels[i]);
        }
        
        this._events.push({ 
            eventCheckMethodName, 
            class1Models, 
            class1EventActionName, 
            class2Models, 
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
        
        this.checkForExtraModelEvents();
    }
    
    checkForExtraModelEvents()
    {
        this._modelExtraEventManager.checkForEvents();
    }
}