import Kernel from '/kernel/kernel';

export default class ControlsInitialiser
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
		this._initialisingFunctions = []; //Functions that add the required event listeners to _registeredEventListeners
		
		//any event-listener functions should be added to this in the below object format, so they can be registered/unregistered:
		//example: { type: "keydown", listener: func(){}, options: false }
		this._registeredEventListeners = [];
    }
	
	initialiseControls()
	{
		this._initialisingFunctions.forEach(func => func());
		this._registeredEventListeners.forEach(
			listenerInfo => window.addEventListener(listenerInfo.type, listenerInfo.listener, listenerInfo.options)
		);
	}
	
	unregisterEventListeners()
	{
		this._registeredEventListeners.forEach(
			listenerInfo => window.removeEventListener(listenerInfo.type, listenerInfo.listener, listenerInfo.options)
		);
	}
}