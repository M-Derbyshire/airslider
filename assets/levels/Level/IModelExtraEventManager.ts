/**
 * Manages any extra events associated with the level's models
 */
export default interface IModelExtraEventManager {
    
    /**
     * Runs the check for extra events on all of the loaded models for this level
     */
    checkForEvents():void;
    
};