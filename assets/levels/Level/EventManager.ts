import Kernel from '../../../Kernel/Kernel';
import IEventManager, { IEvent, IEventDetails } from './IEventManager';
import IModel from '../../models/Model/IModel';
import IKernel from '../../../Kernel/IKernel';

/**
 * Manages the event monitoring for a level (doesn't include touch/mouse events)
 */
export default class EventManager implements IEventManager
{
    private _kernel:IKernel;
    private _events:IEvent[];
    
    constructor()
    {
        this._kernel = Kernel.getInstance();
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
        
        this._kernel.loadedModels.forEach(model => {
            if(model.constructor.name === event.class1.name) class1Models.push(model);
            if(model.constructor.name === event.class2.name) class2Models.push(model);
        });
        
        this._events.push({ 
            eventCheck: event.eventCheck, 
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
        events.forEach(e => this.registerEvent(e));
    }
    
    /**
     * Removes all the registered event checks
     */
    clearEvents():void
    {
        this._events = [];
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
                    if(model1.active && model2.active)
                        event.eventCheck(model1, event.class1EventActionName, model2, event.class2EventActionName);
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
        this._kernel.loadedModels.forEach(model => model.checkForExtraEvents());
    }
};