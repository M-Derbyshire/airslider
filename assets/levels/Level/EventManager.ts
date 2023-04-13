import Kernel from '../../../Kernel/Kernel';
import IEventManager from './IEventManager';
import EventCheckContainer from './EventCheckContainer';
import IModelExtraEventManager from './IModelExtraEventManager';
import IEventDetails from './IEventDetails';
import IModel from '../../models/Model/IModel';
import IKernel from '../../../Kernel/IKernel';
import IEvent from './IEvent';

/**
 * Manages the event monitoring for a level
 */
export default class EventManager implements IEventManager
{
    private _kernel:IKernel;
    private _eventCheckContainer:EventCheckContainer;
    private _modelExtraEventManager:IModelExtraEventManager;
    private _events:IEvent[];
    
    /**
     * Constructor
     * @param eventCheckContainer An instance of the EventCheckContainer (which contains custom methods that will check for events)
     * @param modelExtraEventManager Manages any extra events associated with the level's models
     */
    constructor(eventCheckContainer:EventCheckContainer, modelExtraEventManager:IModelExtraEventManager)
    {
        this._kernel = Kernel.getInstance();
        
        this._eventCheckContainer = eventCheckContainer;
        this._modelExtraEventManager = modelExtraEventManager;
        
        this._events = [];
    }
    
    /**
     * Registers a new event check. All models that are instances of the 2 given classes will be collected. When the 
     * event check is ran, each model of the first class will be checked against each model of the second class, to see 
     * if the event has occurred between them.
     * @param event The details of an event to be registered
     */
    registerEvent(event:IEventDetails):void
    {
        const class1Models:IModel[] = [];
        const class2Models:IModel[] = [];
        
        //LoadedModels is a collection, so can't use foreach
        for(let i = 0; i < this._kernel.loadedModels.length; i++)
        {
            const model = this._kernel.loadedModels[i];
            if(model.constructor.name === event.class1.constructor.name) class1Models.push(model);
            if(model.constructor.name === event.class2.constructor.name) class2Models.push(model);
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
    registerEventsArray(events:IEventDetails[]):void
    {
        events.forEach(e => {
            this.registerEvent(e);
        });
    }
    
    /**
     * Runs the event checks, along with any extra events associated with the level's models
     */
    checkForEvents():void
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
    private _checkForExtraModelEvents():void
    {
        this._modelExtraEventManager.checkForEvents();
    }
}