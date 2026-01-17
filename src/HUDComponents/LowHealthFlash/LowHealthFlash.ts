import IAssetHandler from "../../../Kernel/AssetHandler/IAssetHandler";
import ISoundEngine from "../../../Kernel/engines/SoundEngine/ISoundEngine";
import DamageFlash from "../DamageFlash/DamageFlash";

/**
 * Repeatably flashes a "low health" image on the screen
 */
export default class LowHealthFlash extends DamageFlash 
{
    constructor() 
    {
        super();
    }
    
    /**
     * Loads the component
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    load(assetHandler:IAssetHandler):void
    {
        super.load(assetHandler);
        
        this.image = assetHandler.loadImage("/HUDComponents/LowHealthFlash/images/damage.png");
    }
    
    /**
     * Prepares the component before the level starts
     * @param soundEngine the sound engine for the level
     */
    prepare(soundEngine:ISoundEngine):void
    {
        super.prepare(soundEngine);
        
        this.active = false;
    }
    
    /**
     * Starts the flashing
     */
    startFlashRepeat() {
        this.active = true;
    }
    
    /**
     * Stops the flashing
     */
    stopFlashRepeat() {
        this.active = false;
    }
    
    /**
     * Draw the flash, and keep it looping.
     * The idea here is to utilise the DamageFlash functionality, but to keep 
     * it going continuously, until stop() is called.
     */
    draw() {
        super.draw();
        
        if(this.active && this.opacity <= 0) {
            this.start(this.image);
        }
    }
}