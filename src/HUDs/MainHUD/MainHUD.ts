import ASHUD from '../ASHUD/ASHUD';
import HealthDisplay from '../components/HealthDisplay/HealthDisplay';
import DamageFlash from '../components/DamageFlash/DamageFlash';
import LowHealthFlash from '../components/LowHealthFlash/LowHealthFlash';
import IPointerEventManager from '../../../Kernel/entities/Level/IPointerEventManager';
import PauseButton from '../components/PauseButton/PauseButton';
import Dialog from '../components/UI-Components/Dialog/Dialog';
import TextButton from '../components/UI-Components/TextButton/TextButton';
import Kernel from '../../../Kernel/Kernel';

export default class MainHUD extends ASHUD
{
    private _damageFlash:DamageFlash;
    private _lowHealthFlash:LowHealthFlash;
    
    private _nextLevelDialog:Dialog;
    private _nextLevelButton:TextButton;
    
    private _retryLevelDialog:Dialog;
    private _retryLevelButton:TextButton;
    
    load(pointerEventManager:IPointerEventManager):void
    {
        super.load(pointerEventManager);
        
        this._damageFlash = new DamageFlash();
        this._lowHealthFlash = new LowHealthFlash();
        
        const dialogWidth = 250;
        const dialogHeight = 200;
        const dialogFontSize = 48;
        const dialogButtonWidth = 100;
        const dialogButtonHeight = 50;
        const dialogButtonFontSize = 24;
        
        this._nextLevelButton = new TextButton(
            () => this._triggerNextLevel(),
            0,
            0,
            dialogButtonWidth,
            dialogButtonHeight,
            "Continue",
            dialogButtonFontSize
        );
        this._nextLevelDialog = new Dialog(
            "Track Completed",
            this._nextLevelButton,
            dialogWidth,
            dialogHeight,
            dialogFontSize
        );
        
        this._retryLevelButton = new TextButton(
            () => this._triggerRetryLevel(),
            0,
            0,
            dialogButtonWidth,
            dialogButtonHeight,
            "Retry",
            dialogButtonFontSize
        );
        this._retryLevelDialog = new Dialog(
            "Track Failed",
            this._retryLevelButton,
            dialogWidth,
            dialogHeight,
            dialogFontSize
        );
        
        this.components.push(this._damageFlash);
        this.components.push(this._lowHealthFlash);
        this.components.push(this._nextLevelDialog);
        this.components.push(this._nextLevelButton);
        this.components.push(this._retryLevelDialog);
        this.components.push(this._retryLevelButton);
        this.components.push(new HealthDisplay(25, 500, 150, 200));
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
    
    /**
     * Displays the next-level dialog
     */
    displayNextLevelDialog():void
    {
        this._nextLevelDialog.setDisplay(true);
    }
    
    /**
     * Displays the retry-level dialog
     */
    displayRetryLevelDialog():void
    {
        this._retryLevelDialog.setDisplay(true);
    }
    
    /**
     * Trigger the change to the next level
     */
    private _triggerNextLevel():void
    {
        Kernel.getInstance().unloadCurrentLevel();
    }
    
    /**
     * Trigger the restarting of the level
     */
    private _triggerRetryLevel():void
    {
        Kernel.getInstance().restartCurrentLevel();
    }
}