import Kernel from '/Kernel/kernel';

/**
 * Handles the initialising of the game's controls. 
 * Children of this class should contain methods that add event listeners to this.registeredEventListeners
 */
export default class ControlsInitialiser
{
	/**
	 * Constructor
	 */
    constructor()
    {
        this._kernel = Kernel.getInstance();
		
		/**
		 * Any event-listener functions should be added to this, so they can be registered/unregistered
		 */
		this.registeredEventListeners:IRegisteredEventListener[] = [];
		
		/**
		 * An array of functions that add the required event listeners to this.registeredEventListeners
		 */
		this.initialisingFunctions:{():void;}[] = [];
    }
	
	/**
	 * Calls all control-initialising functions, and sets up the event listeners
	 */
	initialiseControls()
	{
		this.initialisingFunctions.forEach(func => func());
		this.registeredEventListeners.forEach(
			listenerInfo => window.addEventListener(listenerInfo.type, listenerInfo.listener, listenerInfo.options)
		);
	}
	
	/**
	 * Removes any registered event listeners
	 */
	unregisterEventListeners()
	{
		this.registeredEventListeners.forEach(
			listenerInfo => window.removeEventListener(listenerInfo.type, listenerInfo.listener, listenerInfo.options)
		);
		
		this.registeredEventListeners = [];
	}
}