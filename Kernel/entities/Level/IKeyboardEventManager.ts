/**
 * Manages any keyboard events
 */
export default interface IKeyboardEventManager {
    /**
     * Registers a callback function that will be called when a key-down event occurs
     * @param callback the callback to register
     */
    addKeyDownEventCallback(callback:(e:KeyboardEvent)=>void):void;
    
    /**
     * Registers a callback function that will be called when a key-up event occurs
     * @param callback the callback to register
     */
    addKeyUpEventCallback(callback:(e:KeyboardEvent)=>void):void;
    
    /**
     * Unregisters all of the event callbacks
     */
    removeKeyboardEventCallbacks():void;
    
    /**
     * Removes the keyboard event listeners
     */
    removeEventHandlers():void;
};