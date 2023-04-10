import IEventDetails from "./IEventDetails";

/**
 * Manages the event monitoring for a level
 */
export default interface IEventManager {
    
    /**
     * Registers a new event check. All models that are instances of the 2 given classes will be collected. When the 
     * event check is ran, each model of the first class will be checked against each model of the second class, to see 
     * if the event has occurred between them.
     * @param e The details of an event to be registered
     */
    registerEvent(e:IEventDetails):void;
    
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