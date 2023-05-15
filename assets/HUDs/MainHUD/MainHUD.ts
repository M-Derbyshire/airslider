import ASHUD from '../ASHUD/ASHUD';
import HealthBar from '../components/HealthBar/HealthBar';
import DamageFlash, { IDamageFlashImages } from '../components/DamageFlash/DamageFlash';
import LowHealthFlash from '../components/LowHealthFlash/LowHealthFlash';
import ICamera from '../../../engines/GraphicEn/ICamera';
import IPointerEventManager from '../../levels/Level/IPointerEventManager';

export default class MainHUD extends ASHUD
{
    private _damageFlash:DamageFlash;
    private _lowHealthFlash:LowHealthFlash;
    
    constructor()
    {
        super();
    }
    
    load(canvasCtx:CanvasRenderingContext2D, camera:ICamera, pointerEventManager:IPointerEventManager):void
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
    
    get damageFlash() { return this._damageFlash; }
    
    /**
     * Starts the damage flash
     * @param color the flash image to use
     */
    startDamageFlash(color:keyof IDamageFlashImages):void
    {
        this._damageFlash.start(color);
    }
    
    /**
     * Is the low health flash currently flashing?
     * @returns true if the flash is active, false if not
     */
    isLowHealthFlashActive():boolean
    {
        return this._lowHealthFlash.active;
    }
    
    /**
     * Starts the low health flash
     */
    startLowHealthFlash():void
    {
        this._lowHealthFlash.startFlashRepeat();
    }
    
    /**
     * Stops the low health flash
     */
    stopLowHealthFlash():void
    {
        this._lowHealthFlash.stopFlashRepeat();
    }
}