import ILevel from "../assets/levels/Level/ILevel";
import IModel from "../assets/models/Model/IModel";
import IPreparedEngines from "./IPreparedEngines";

/**
 * A loaded level, with the other elements it requires
 */
export default interface ILoadedLevel {
    
    /**
     * The loaded level
     */
    level:ILevel;
    
    /**
     * Has this level been prepared? (using the Level.prepare method)
     */
    hasBeenPrepared:boolean;
    
    /**
     * The models loaded by the level
     */
    loadedModels:IModel[];
    
    /**
     * The engines that will run this level
     */
    preparedEngines:IPreparedEngines;
    
};