import ICamera from "./ICamera";

/**
 * The engine that controls the drawing to the screen
 */
export default interface IGraphicEngine {
    /**
     * The camera for the level
     */
    camera:ICamera;
    
    /**
     * Triggers the clearing and re-drawing of the screen
     */
    run():void;
};