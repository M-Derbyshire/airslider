import Kernel from '/kernel/kernel';
import HUD from '/assets/HUDs/HUD/HUD';
import HealthBar from '/assets/HUDs/components/HealthBar/HealthBar';
import DamageFlash from '/assets/HUDs/components/DamageFlash/DamageFlash';

export default class MainHUD extends HUD
{
    constructor()
    {
        super(HUD);
        
        this._damageFlashIndex;
    }
    
    load(canvasCtx, camera)
    {
        super.load(canvasCtx, camera);
        
        this.components.push(new HealthBar(100, 50, 800, 60, 0)); //0 will always be the player's index
        this.components.push(new DamageFlash())
        
        //DamageFlash needs to be called by the player's character model
        this._damageFlashIndex = this.components.length - 1;
        
        this.loadComponents(canvasCtx, camera);
    }
    
    get damageFlash() { return this.components[this._damageFlashIndex]; }
    
    startDamageFlash(color)
    {
        this.components[this._damageFlashIndex].start(color);
    }
}