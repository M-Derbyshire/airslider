import Kernel from "../../../Kernel/Kernel";
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
    
    load():void 
    {
        super.load();
        
        this.image = Kernel.getInstance().loadImage("/HUDComponents/LowHealthFlash/images/damage.png");
    }
    
    prepare():void 
    {
        super.prepare();
        
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