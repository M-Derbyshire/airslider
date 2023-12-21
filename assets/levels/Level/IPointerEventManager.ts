/**
 * Manages any events relating to mouse clicks or screen touches
 */
export default interface IPointerEventManager {
    /**
     * Adds an object to the list of objects that should react to being clicked
     * (the subject object must have both an "onClick" and an "isPointerOverlapping" method)
     * @param subject an object that should react to being clicked
     */
    addPointerEventSubject(subject:any):void;
    
    /**
     * Removes all click and touch event listeners from the canvas
     */
    removeCanvasEventHandlers():void;
};