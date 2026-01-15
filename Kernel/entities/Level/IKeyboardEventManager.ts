/**
 * Manages any keyboard events
 */
export default interface IKeyboardEventManager {
    /**
     * Registers a callback function that will be called when a key-down event occurs
     * @param callback the callback to register
     * @param isActiveWhenPaused should this callback still be triggered when the game is paused?
     */
    addKeyDownEventCallback(callback:(e:KeyboardEvent)=>void, isActiveWhenPaused?:boolean):void;
    
    /**
     * Registers a callback function that will be called when a key-up event occurs
     * @param callback the callback to register
     * @param isActiveWhenPaused should this callback still be triggered when the game is paused?
     */
    addKeyUpEventCallback(callback:(e:KeyboardEvent)=>void, isActiveWhenPaused?:boolean):void;
    
    /**
     * Unregisters all of the event callbacks
     */
    removeKeyboardEventCallbacks():void;
    
    /**
     * Removes the keyboard event listeners
     */
    removeEventHandlers():void;
};