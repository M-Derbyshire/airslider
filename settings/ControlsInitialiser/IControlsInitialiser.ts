import IRegisteredEventListener from "./IRegisteredEventListener";

/**
 * Handles the initialising of the game's controls. 
 * Children of this class should contain methods that add event listeners to this.registeredEventListeners
 */
export default interface IControlsInitialiser {
    /**
     * Any event-listener functions should be added to this, so they can be registered/unregistered
     * (these will be registered with the browser via window.addEventListener)
     */
    registeredEventListeners:IRegisteredEventListener[];
    
    /**
     * An array of functions that add the required event listeners to this.registeredEventListeners
     */
    initialisingFunctions:{():void;}[];
    
    /**
	 * Calls all control-initialising functions (this.initialisingFunctions), and sets up the event listeners
	 */
	initialiseControls():void;
    
    /**
	 * Removes any registered event listeners
	 */
	unregisterEventListeners():void;
};