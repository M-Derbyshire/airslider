import { KernelStatus } from "../../IKernel";
import Kernel from "../../Kernel";
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
     * @param isActiveWhenPaused should this callback still be triggered when the game is paused?
     */
    addKeyDownEventCallback(
        callback:KeyboardEventReciever,
        isActiveWhenPaused:boolean = false
    ):void
    {
        const callbackToUse = isActiveWhenPaused
            ? callback
            : this._getPauseableCallbackWrapper(callback);
        
        this._keyDownEventCallbacks.push(callbackToUse);
    }
    
    /**
     * Registers a callback function that will be called when a key-up event occurs
     * @param callback the callback to register
     * @param isActiveWhenPaused should this callback still be triggered when the game is paused?
     */
    addKeyUpEventCallback(
        callback:KeyboardEventReciever,
        isActiveWhenPaused:boolean = false
    ):void
    {
        const callbackToUse = isActiveWhenPaused
            ? callback
            : this._getPauseableCallbackWrapper(callback);
        
        this._keyUpEventCallbacks.push(callbackToUse);
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
    
    /**
     * Wraps the given callback in a wrapper function that will stop it from
     * being triggered when the game is paused
     * @param callback the callback to be wrapped
     * @returns a new callback function that will not trigger the given callback if
     * the game is paused
     */
    private _getPauseableCallbackWrapper(callback:KeyboardEventReciever):KeyboardEventReciever
    {
        return (e:KeyboardEvent) => {
            if(Kernel.getInstance().status !== KernelStatus.Paused)
                callback(e);
        };
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