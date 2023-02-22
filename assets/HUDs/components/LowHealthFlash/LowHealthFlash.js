import DamageFlash from "/assets/HUDs/components/DamageFlash/damageFlash";

export default class LowHealthFlash extends DamageFlash {
    constructor() {
        super(DamageFlash);
    }
    
    load(canvasCtx, camera) {
        super.load(canvasCtx, camera);
        
        this.images = {
            damage: this.kernel.loadImage("/assets/HUDs/components/LowHealthFlash/images/damage.png")
        };
        
        this.color = "damage";
        this.active = false;
    }
    
    // The idea here is to utilise the DamageFlash functionality, but keep 
    // it going until stop is called.
    
    startFlashRepeat() {
        this.active = true;
    }
    
    stopFlashRepeat() {
        this.active = false;
    }
    
    draw() {
        super.draw();
        
        if(this.active && this.opacity <= 0) {
            this.start(this.color);
        }
    }
}