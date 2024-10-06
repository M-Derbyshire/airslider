/**
 * Represents an event listener (these will be registered with the browser via window.addEventListener)
 */
export default interface IRegisteredEventListener {
    /**
     * The type of the event listener (e.g. "keydown")
     */
    type:string;
    
    /**
     * The callback for the event listener
     * @param e the event object
     */
    listener(e:any):void;
};