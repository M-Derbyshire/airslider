/**
 * The engine that triggers the actions of levels/models. It also triggers the checking for in-game events
 */
export default interface IGameEn{
    
    /**
     * Triggers the actions of levels/models, and then triggers the event checking/handling
     */
    run():void;
    
};