import IGameEn from "../engines/GameEn/IGameEn";
import IGraphicEn from "../engines/GraphicEn/IGraphicEn";
import ISoundEn from "../engines/SoundEn/ISoundEn";

/**
 * The engines that will be used to run a level
 */
export default interface IPreparedEngines {
    
    /**
     * The game engine
     */
    gameEn:IGameEn;
    
    /**
     * The graphic engine
     */
    graphicEn:IGraphicEn;
    
    /**
     * The sound engine
     */
    soundEn:ISoundEn;
    
};