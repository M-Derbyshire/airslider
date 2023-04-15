import IModel from "../../models/Model/IModel";

/**
 * The details that relate to an event that can occur between 2 types of model
 */
export default interface IEventDetails {
    
    /**
     * The name of this event's method, which should exist in the EventCheckContainer class
     */
    eventCheckMethodName:string;
    
    /**
     * The first model class that is involved in this type of event
     */
    class1:new()=>IModel;
    
    /**
     * The name of the method (on the first model type) that should be triggered when this event occurs
     */
    class1EventActionName:string;
    
    /**
     * The second model class that is involved in this type of event
     */
    class2:new()=>IModel;
    
    /**
     * The name of the method (on the second model type) that should be triggered when this event occurs
     */
    class2EventActionName:string;
    
}