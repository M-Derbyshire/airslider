import ASHUD from '../ASHUD/ASHUD';
import HealthDisplay from '../components/HealthDisplay/HealthDisplay';
import DamageFlash from '../components/DamageFlash/DamageFlash';
import LowHealthFlash from '../components/LowHealthFlash/LowHealthFlash';
import IPointerEventManager from '../../levels/Level/IPointerEventManager';
import PauseButton from '../components/PauseButton/PauseButton';

export default class MainHUD extends ASHUD
{
    private _damageFlash:DamageFlash;
    private _lowHealthFlash:LowHealthFlash;
    
    load(pointerEventManager:IPointerEventManager):void
    {
        super.load(pointerEventManager);
        
        this._damageFlash = new DamageFlash();
        this._lowHealthFlash = new LowHealthFlash();
        
        const playerModelIndex = 0; //0 will always be the player's index
        
        this.components.push(this._damageFlash);
        this.components.push(this._lowHealthFlash);
        this.components.push(new HealthDisplay(25, 500, 150, 200, playerModelIndex));
        this.components.push(new PauseButton(920, 25, 65, 100));
    }
    
    /**
     * Starts the damage flash
     * @param image the flash image to use
     */
    startDamageFlash(image:HTMLImageElement):void
    {
        this._damageFlash.start(image);
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
    
    /**
     * Is the low health flash currently flashing?
     * @returns true if the flash is active, false if not
     */
    isLowHealthFlashActive():boolean
    {
        return this._lowHealthFlash.active;
    }
}