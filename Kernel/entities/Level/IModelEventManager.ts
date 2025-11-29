import IModel from "../Model/IModel";

/**
 * Manages the event monitoring between models
 */
export default interface IModelEventManager {
    /**
     * Registers a new event check. All models that are instances of the 2 given classes will be collected. When the 
     * event check is ran, each model of the first class will be checked against each model of the second class, to see 
     * if the event has occurred between them.
     * @param event The details of an event to be registered
     */
    registerEvent(event:IModelEventRegistrationDetails):void;
    
    /**
     * Registers multiple event checks. See registerEvent method for more details
     * @param events The details of the events to be registered
     */
    registerEventsArray(events:IModelEventRegistrationDetails[]):void;
    
    /**
     * Removes all the registered event checks
     */
    clearEvents():void;
    
    /**
     * Runs the event checks, along with any extra events associated with the level's models
     */
    checkForEvents():void;    
};


/**
 * Represents a "reaction" callback that should be called when an event has occured
 */
export type eventReactionCallback = (model1:IModel, model2:IModel)=>void;

/**
 * Represents a function that tests for the occurence of an event, and then calls the "reaction" callback if the event 
 * has occured.
 */
export type eventCheck = (modelA:IModel, modelB:IModel, reactionCallback:eventReactionCallback)=>void;




/**
 * The details that are needed to register an event with an IEventManager
 */
export interface IModelEventRegistrationDetails {
    /**
     * The function that checks for this event (and then may call the action methods on the models involved)
     */
    check:eventCheck;
    
    /**
     * The first model class that is involved in this type of event
     */
    class1:new(...args:any[])=>IModel;
    
    /**
     * The second model class that is involved in this type of event
     */
    class2:new(...args:any[])=>IModel;
    
    /**
     * A callback that should be triggered when this event occurs
     */
    reactionCallback:eventReactionCallback;
};




/**
 * The data that's required to check for occurrences of an event that can occur between 2 types of model
 */
export interface IModelEvent {
    /**
     * The function that checks for this event (and then may call the "reaction" callback, if the event occurs)
     */
    check:eventCheck;
    
    // ---------------------------------------------------------------------------
    // Events can happen between 2 types of model (E.g. a Ball class and a Bat class).
    // You would want all balls to react to collisions with all bats.
    // ---------------------------------------------------------------------------
    
    /**
     * All of the models that are instances of the first class involved in this type of event
     */
    class1Models:IModel[];
    
    /**
     * All of the models that are instances of the second class involved in this type of event
     */
    class2Models:IModel[];
    
    /**
     * A callback that should be triggered when this event occurs
     */
    reactionCallback:eventReactionCallback;
};