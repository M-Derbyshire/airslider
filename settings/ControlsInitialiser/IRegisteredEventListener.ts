
export default interface IRegisteredEventListener {
    
    /**
     * The type of the event listener (e.g. "keydown")
     */
    type:string;
    
    /**
     * The callback for the event listener
     * @param e the event object
     * @returns 
     */
    listener(e:any):void;
    
};