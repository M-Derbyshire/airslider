/**
 * Manages any events relating to mouse clicks
 */
export default interface IPointerEventManager {
    /**
     * Registers callback functions that handle pointer events for a subject.
     * @param isPointerOverlapping callback function that determines if the pointer is overlapping the subject. The
     * pointer X/Y parameters are the positions on the canvas, not on the screen
     * @param isActive callback function that determines if the subject is active
     * @param onClick callback function that should be called when the subject is clicked
     * @param onHover callback function that should be called when the pointer is hovering over the subject
     * @param isActiveWhenPaused should pointer events for this subject still be active when the game is paused?
     */
    addPointerEventSubject(
        isPointerOverlapping:(canvasPointerX:number, canvasPointerY:number)=>boolean,
        isActive:()=>boolean,
        onClick?:()=>void,
        onHover?:()=>void,
        isActiveWhenPaused?:boolean
    ):void;
    
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