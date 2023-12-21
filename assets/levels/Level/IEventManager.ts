import IModel from "../../models/Model/IModel";

/**
 * Manages the event monitoring for a level (doesn't include touch/mouse events)
 */
export default interface IEventManager {
    /**
     * Registers a new event check. All models that are instances of the 2 given classes will be collected. When the 
     * event check is ran, each model of the first class will be checked against each model of the second class, to see 
     * if the event has occurred between them.
     * @param event The details of an event to be registered
     */
    registerEvent(event:IEventDetails):void;
    
    /**
     * Registers multiple event checks. See registerEvent method for more details
     * @param events The details of the events to be registered
     */
    registerEventsArray(events:IEventDetails[]):void;
    
    /**
     * Runs the event checks, along with any extra events associated with the level's models
     */
    checkForEvents():void;    
};




/**
 * Represents a function that tests for the occurence of an event between 2 models, and then may call the required 
 * response methods on those models.
 * 
 * The "ActionMethodName" parameters are names of methods on each class. Those methods can be called if the event occurs.
 */
export type eventCheck = (modelA:IModel, modelAActionMethodName:string, modelB:IModel, modelBActionMethodName:string)=>void;




/**
 * The details that are needed to register an event with an IEventManager
 */
export interface IEventDetails {
    /**
     * The function that checks for this event (and then may call the action methods on the models involved)
     */
    eventCheck:eventCheck;
    
    /**
     * The first model class that is involved in this type of event
     */
    class1:new(...args:any[])=>IModel;
    
    /**
     * The name of the method (on the first model type) that should be triggered when this event occurs
     */
    class1EventActionName:string;
    
    /**
     * The second model class that is involved in this type of event
     */
    class2:new(...args:any[])=>IModel;
    
    /**
     * The name of the method (on the second model type) that should be triggered when this event occurs
     */
    class2EventActionName:string;
};




/**
 * The data that's required to check for occurrences of an event that can occur between 2 types of model
 */
export interface IEvent {
    /**
     * The function that checks for this event (and then may call the action methods on the models involved)
     */
    eventCheck:eventCheck;
    
    // ---------------------------------------------------------------------------
    // Events happen between 2 types of model (E.g. a Ball class and a Bat class).
    // You would want all balls to react to collisions with all bats.
    // Certain methods will then be called on all models involved.
    // ---------------------------------------------------------------------------
    
    /**
     * All of the models that are instances of the first class involved in this type of event
     */
    class1Models:IModel[];
    
    /**
     * The name of the method (on the first model type) that should be triggered when this event occurs
     */
    class1EventActionName:string;
    
    /**
     * All of the models that are instances of the second class involved in this type of event
     */
    class2Models:IModel[];
    
    /**
     * The name of the method (on the second model type) that should be triggered when this event occurs
     */
    class2EventActionName:string;   
};