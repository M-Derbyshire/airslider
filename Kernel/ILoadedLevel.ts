import ILevel from "../src/levels/Level/ILevel";
import IModel from "../src/models/Model/IModel";
import ILevelEngines from "./ILevelEngines";

/**
 * A level that has been loaded, along with the other elements it requires
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
    engines:ILevelEngines;
};