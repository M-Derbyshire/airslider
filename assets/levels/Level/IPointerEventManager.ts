/**
 * Manages any events relating to mouse clicks or screen touches
 */
export default interface IPointerEventManager {
    /**
     * Adds an object (if valid) to the list of objects that should react to mouse pointer events.
	 * An object must be considered a valid pointer-event subject, or it will be ignored
     * (to be valid, it must have an "isPointerOverlapping" method, and either an "onClick" or an "onHover" method).
	 * This will not re-add a subject that it already holds a reference to.
     * @param subject an object that should react to a pointer event
     */
    addPointerEventSubject(subject:any):void;
    
    /**
     * Checks the pointer-event subjects to see if any are being hovered over, and triggers 
     * their "onHover" methods.
     */
    checkForHoverEvents():void;
    
    /**
     * Removes the event listeners from the canvas
     */
    removeEventHandlers():void;
};