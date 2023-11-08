import ASHUD from '../ASHUD/ASHUD';
import HealthDisplay from '../components/HealthDisplay/HealthDisplay';
import DamageFlash from '../components/DamageFlash/DamageFlash';
import LowHealthFlash from '../components/LowHealthFlash/LowHealthFlash';
import ICamera from '../../../engines/GraphicEn/ICamera';
import IPointerEventManager from '../../levels/Level/IPointerEventManager';
import PauseButton from '../components/PauseButton/PauseButton';

export default class MainHUD extends ASHUD
{
    private _damageFlash:DamageFlash;
    private _lowHealthFlash:LowHealthFlash;
    
    constructor()
    {
        super();
    }
    
    load(camera:ICamera, pointerEventManager:IPointerEventManager):void
    {
        super.load(camera, pointerEventManager);
        
        this._damageFlash = new DamageFlash();
        this._lowHealthFlash = new LowHealthFlash();
        
        this.components.push(this._damageFlash);
        this.components.push(this._lowHealthFlash);
        this.components.push(new HealthDisplay(25, 500, 150, 200, 0)); //0 will always be the player's index
        this.components.push(new PauseButton(920, 25, 65, 100));
        
        // move this to parent load()?
        this.loadComponents();
    }
    
    get damageFlash() { return this._damageFlash; }
    
    /**
     * Starts the damage flash
     * @param color the flash image to use
     */
    startDamageFlash(image:HTMLImageElement):void
    {
        this._damageFlash.start(image);
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