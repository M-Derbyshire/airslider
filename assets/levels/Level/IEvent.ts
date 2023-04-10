import IModel from "../../models/Model/IModel";

/**
 * The data that's required to check for occurrences of an event that can occur between 2 types of model
 */
export default interface IEvent {
    
    /**
     * The name of this event's method, which should exist in the EventCheckContainer class
     */
    eventCheckMethodName:string;
    
    
    
    // Events happen between 2 types of model. E.g. a Ball class and a Bat class.
    // You would want all balls to react to collisions with all bats.
    // Certain methods will then be called on all models involved.
    
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
    
}