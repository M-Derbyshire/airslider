import ICamera from "../../../../engines/GraphicEn/ICamera";
import DamageFlash from "../DamageFlash/DamageFlash";

/**
 * Repeatably flashes a "low health" image on the screen
 */
export default class LowHealthFlash extends DamageFlash 
{
    /**
     * Constructor
     */
    constructor() 
    {
        super();
    }
    
    load(canvasCtx:CanvasRenderingContext2D, camera:ICamera):void 
    {
        super.load(canvasCtx, camera);
        
        this.image = this.kernel.loadImage("/assets/HUDs/components/LowHealthFlash/images/damage.png");
    }
    
    prepare():void 
    {
        super.prepare();
        
        this.active = false;
    }
    
    // The idea here is to utilise the DamageFlash functionality, but keep 
    // it going until stop is called.
    
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
    
    draw() {
        super.draw();
        
        if(this.active && this.opacity <= 0) {
            this.start(this.image);
        }
    }
}