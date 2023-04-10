import ASHUD from '/assets/HUDs/ASHUD/ASHUD';
import HealthBar from '/assets/HUDs/components/HealthBar/HealthBar';
import DamageFlash from '/assets/HUDs/components/DamageFlash/damageFlash';
import LowHealthFlash from '../components/LowHealthFlash/LowHealthFlash';

export default class MainHUD extends ASHUD
{
    constructor()
    {
        super(ASHUD);
        
        this._damageFlash;
        this._lowHealthFlash;
    }
    
    load(canvasCtx, camera, pointerEventManager)
    {
        super.load(canvasCtx, camera, pointerEventManager);
        
        this._damageFlash = new DamageFlash();
        this._lowHealthFlash = new LowHealthFlash();
		
		this.components.push(this._damageFlash);
        this.components.push(this._lowHealthFlash);
        this.components.push(new HealthBar(100, 50, 800, 60, 0)); //0 will always be the player's index
        
        // move this to parent load()?
        this.loadComponents(canvasCtx, camera);
    }
    
    get damageFlash() { return this.components[this._damageFlashIndex]; }
    
    startDamageFlash(color)
    {
        this._damageFlash.start(color);
    }
    
    isLowHealthFlashActive()
    {
        return this._lowHealthFlash.active;
    }
    
    startLowHealthFlash()
    {
        this._lowHealthFlash.startFlashRepeat();
    }
    
    stopLowHealthFlash()
    {
        this._lowHealthFlash.stopFlashRepeat();
    }
}