import Kernel from '/kernel/kernel';
import HUD from '/assets/HUDs/HUD/HUD';
import HealthBar from '/assets/HUDs/components/HealthBar/HealthBar';
import DamageFlash from '/assets/HUDs/components/DamageFlash/DamageFlash';

export default class MainHUD extends HUD
{
    constructor()
    {
        super(HUD);
        
        this._damageFlash;
    }
    
    load(canvasCtx, camera, pointerEventManager)
    {
        super.load(canvasCtx, camera, pointerEventManager);
        
		//DamageFlash needs to be called by the player's character model
		//Therefore, we need to keep a 
        this._damageFlash = new DamageFlash();
		
		this.components.push(this._damageFlash);
        this.components.push(new HealthBar(100, 50, 800, 60, 0)); //0 will always be the player's index
        
        this.loadComponents(canvasCtx, camera);
    }
    
    get damageFlash() { return this.components[this._damageFlashIndex]; }
    
    startDamageFlash(color)
    {
        this._damageFlash.start(color);
    }
}