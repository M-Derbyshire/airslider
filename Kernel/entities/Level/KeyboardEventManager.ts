import IKeyboardEventManager from "./IKeyboardEventManager";

/**
 * Manages any keyboard events
 */
export default class KeyboardEventManager implements IKeyboardEventManager
{
    private _keyDownEventListener:KeyboardEventReciever;
    private _keyUpEventListener:KeyboardEventReciever;
    
    private _keyDownEventCallbacks:KeyboardEventReciever[];
    private _keyUpEventCallbacks:KeyboardEventReciever[];
    
    constructor()
    {
        this._keyDownEventCallbacks = [];
        this._keyUpEventCallbacks = [];
        
        this._keyDownEventListener = (e:KeyboardEvent) => this._keyDownEventHandler(e);
        this._keyUpEventListener = (e:KeyboardEvent) => this._keyUpEventHandler(e);
        
        window.addEventListener(EventListenerType.KeyDown, this._keyDownEventListener);
        window.addEventListener(EventListenerType.KeyUp, this._keyUpEventListener);
    }
    
    /**
     * Registers a callback function that will be called when a key-down event occurs
     * @param callback the callback to register
     */
    addKeyDownEventCallback(callback:KeyboardEventReciever):void
    {
        this._keyDownEventCallbacks.push(callback);
    }
    
    /**
     * Registers a callback function that will be called when a key-up event occurs
     * @param callback the callback to register
     */
    addKeyUpEventCallback(callback:KeyboardEventReciever):void
    {
        this._keyUpEventCallbacks.push(callback);
    }
    
    /**
     * Unregisters all of the event callbacks
     */
    removeKeyboardEventCallbacks():void
    {
        this._keyDownEventCallbacks = [];
        this._keyUpEventCallbacks = [];
    }
    
    /**
     * Removes the keyboard event listeners
     */
    removeEventHandlers():void
    {
        window.removeEventListener(EventListenerType.KeyDown, this._keyDownEventListener);
        window.removeEventListener(EventListenerType.KeyUp, this._keyUpEventListener);
    }
    
    /**
     * Handles the key-down events
     * @param e the keyboard event details
     */
    private _keyDownEventHandler(e:KeyboardEvent):void
    {
        this._keyDownEventCallbacks.forEach(cb => cb(e));
    }
    
    /**
     * Handles the key-up events
     * @param e the keyboard event details
     */
    private _keyUpEventHandler(e:KeyboardEvent):void
    {
        this._keyUpEventCallbacks.forEach(cb => cb(e));
    }
};

/**
 * Types of keyboard-related event listeners
 */
enum EventListenerType {
    KeyDown = "keydown",
    KeyUp = "keyup"
};

/**
 * A function that takes a keyboard event, to be handled
 */
type KeyboardEventReciever = (e:KeyboardEvent)=>void;