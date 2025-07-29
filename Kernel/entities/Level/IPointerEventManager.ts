/**
 * Manages any events relating to mouse clicks or screen touches
 */
export default interface IPointerEventManager {
    /**
     * Adds an object (if valid) to the list of objects that should react to mouse pointer events.
	 * The object must be considered a valid pointer-event subject, or an error will be thrown
     * (to be valid, it must have an "isPointerOverlapping" method, and either an "onClick" or an "onHover" method).
	 * This will not re-add a subject that it already holds a reference to.
     * @param subject an object that should react to a pointer event
     * @param isActiveWhenPaused should pointer events for this subject still be active when the game is paused?
     */
    addPointerEventSubject(subject:any, isActiveWhenPaused?:boolean):void;
    
    /**
     * Unregisters all of the event subjects
     */
    removePointerEventSubjects():void;
    
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