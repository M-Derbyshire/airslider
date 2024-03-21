import IRegisteredEventListener from './IRegisteredEventListener';
import Kernel from '../../Kernel/Kernel';
import IKernel from '../../Kernel/IKernel';
import IControlsInitialiser from './IControlsInitialiser';

/**
 * Handles the initialising of the game's controls. 
 * Children of this class should contain methods that add event listeners to the this.registeredEventListeners array
 */
export default class ControlsInitialiser implements IControlsInitialiser
{
	protected kernel:IKernel;
	
	/**
	 * Any event-listener functions should be added to this, so they can be registered/unregistered
	 */
	protected registeredEventListeners:IRegisteredEventListener[];
	
	/**
	 * An array of functions that add the required event listeners to this.registeredEventListeners
	 */
	protected initialisingFunctions:{():void;}[];
	
    constructor()
    {
        this.kernel = Kernel.getInstance();
		
		this.registeredEventListeners = [];
		this.initialisingFunctions = [];
    }
	
	/**
	 * Calls all control-initialising functions (this.initialisingFunctions), and sets up the event listeners
	 */
	initialiseControls():void
	{
		this.initialisingFunctions.forEach(func => func());
		this.registeredEventListeners.forEach(
			listenerInfo => window.addEventListener(listenerInfo.type, listenerInfo.listener)
		);
	}
	
	/**
	 * Removes any registered event listeners
	 */
	unregisterEventListeners():void
	{
		this.registeredEventListeners.forEach(
			listenerInfo => window.removeEventListener(listenerInfo.type, listenerInfo.listener)
		);
		
		this.registeredEventListeners = [];
	}
}