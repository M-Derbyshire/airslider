import Kernel from "../Kernel";

/**
 * Provides methods that can be used to manage the game's fullscreen mode
 */
export default class FullscreenHelper
{
    /**
     * Is the fullscreen feature available in the user's browser?
     * @returns true if the feature is available, false if not
     */
    static isFeatureAvailable():boolean
    {
        const canvas = this._getCanvasOrNull();
        
        return !!canvas?.requestFullscreen && document.fullscreenEnabled;
    }
    
    /**
     * Is the game currently in fullscreen mode?
     * @returns true if the game is currently fullscreen, false if not
     */
    static isFullscreen():boolean
    {
        return document.fullscreenElement === this._getCanvasOrNull();
    }
    
    /**
     * Toggles between fullscreen mode, and the regular canvas size
     */
    static toggleFullscreen():void
    {
        if(!this.isFeatureAvailable())
            return;
        
        const canvas = this._getCanvasOrNull();
        
        if(this.isFullscreen())
            document.exitFullscreen();
        else
            canvas?.requestFullscreen();
    }
    
    /**
     * Gets the canvas element, or null if it's not available
     * @returns null if no canvas is available, otherwise the canvas element
     */
    private static _getCanvasOrNull():HTMLCanvasElement|null
    {
        return Kernel.getInstance().canvasContext?.canvas ?? null;
    }
};