import IModelEventManager, { IModelEvent, IModelEventRegistrationDetails } from './IModelEventManager';
import IModel from '../Model/IModel';

/**
 * Manages the event monitoring between models
 */
export default class ModelEventManager implements IModelEventManager
{
    private _events:IModelEvent[];
    
    constructor()
    {
        this._events = [];
    }
    
    /**
     * Registers a new event check. All models that are instances of the 2 given classes will be collected. When the 
     * event check is ran, each model of the first class will be checked against each model of the second class, to see 
     * if the event has occurred between them.
     * @param event The details of an event to be registered
     * @param models The models for the current level
     */
    registerEvent(event:IModelEventRegistrationDetails, models:IModel[]):void
    {
        const class1Models:IModel[] = [];
        const class2Models:IModel[] = [];
        
        models.forEach(model => {
            if(model.constructor === event.class1) class1Models.push(model);
            if(model.constructor === event.class2) class2Models.push(model);
        });
        
        this._events.push({ 
            check: event.check, 
            class1Models,
            class2Models,
            reactionCallback: event.reactionCallback
        });
    }
    
    /**
     * Registers multiple event checks. See registerEvent method for more details
     * @param events The details of the events to be registered
     * @param models The models for the current level
     */
    registerEventsArray(events:IModelEventRegistrationDetails[], models:IModel[]):void
    {
        events.forEach(e => this.registerEvent(e, models));
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
     * @param models The models for the current level
     */
    checkForEvents(models:IModel[]):void
    {
        //For each event, go through the models for class1, and then
        //check them against each model for class2.
        this._events.forEach((event) => {
            
            event.class1Models.forEach((model1) => {
                
                event.class2Models.forEach((model2) => {
                    if(model1.active && model2.active)
                        event.check(model1, model2, event.reactionCallback);
                });
                
            });
            
        });
        
        this._checkForExtraModelEvents(models);
    }
    
    /**
     * Runs any extra events associated with the level's models
     * @param models The models for the current level
     */
    private _checkForExtraModelEvents(models:IModel[]):void
    {
        models.forEach(model => {
            if(model.active)
                model.checkForExtraEvents();
        });
    }
};