import IGameEngine from "../engines/GameEngine/IGameEngine";
import IGraphicEngine from "../engines/GraphicEngine/IGraphicEngine";
import ISoundEngine from "../engines/SoundEngine/ISoundEngine";

/**
 * The engines that will be used to run a level
 */
export default interface IPreparedEngines {
    
    /**
     * The game engine
     */
    gameEngine:IGameEngine;
    
    /**
     * The graphic engine
     */
    graphicEngine:IGraphicEngine;
    
    /**
     * The sound engine
     */
    soundEngine:ISoundEngine;
    
};