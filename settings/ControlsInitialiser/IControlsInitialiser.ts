/**
 * Handles the initialising of the game's controls. 
 * Children of this class should contain methods that add event listeners to the this.registeredEventListeners array
 */
export default interface IControlsInitialiser {
    /**
	 * Calls all control-initialising functions (this.initialisingFunctions), and sets up the event listeners
	 */
	initialiseControls():void;
    
    /**
	 * Removes any registered event listeners
	 */
	unregisterEventListeners():void;
};