import ASHUD from "../ASHUD/ASHUD";
import TextOnly from "../../HUDComponents/UI-Components/TextOnly/TextOnly";
import TextButton from "../../HUDComponents/UI-Components/TextButton/TextButton";
import Kernel from "../../../Kernel/Kernel";
import FullscreenHelper from "../../../Kernel/utils/FullscreenHelper";
import FullscreenButton from "../../HUDComponents/FullscreenButton/FullscreenButton";

/**
 * HUD for all the loading screens
 */
export default class LoadingScreenHUD extends ASHUD
{
    private _loadingTextDisplay:TextOnly; // The "Loading..." text component
    private _continueButton:TextButton; // The button used to start the loaded level
    private _fullscreenButton:FullscreenButton|null; // The fullscreen toggle button (if the feature is available)
    
    constructor()
    {
        super();
        
        const fontName = "Arial";
        const fontSize = 50;
        const textAlign = "center";
        
        const xPos = 500;
        const yPos = 850;
        
        this._loadingTextDisplay = new TextOnly(
            "Loading...",
            xPos,
            yPos,
            fontSize,
            fontName,
            "#FFFFFF",
            "bold",
            textAlign
        );
        
        const btnWidth = 150;
        const btnHeight = 75
        this._continueButton = new TextButton(
            () => Kernel.getInstance().unloadCurrentLevel(),
            xPos - (btnWidth / 2),
            yPos - (btnHeight / 2),
            btnWidth,
            btnHeight,
            "Continue",
            fontSize
        );
        
        this.components = [
            this._loadingTextDisplay,
            this._continueButton
        ];
        
        this._fullscreenButton = null;
        if(FullscreenHelper.isFeatureAvailable())
        {
            this._fullscreenButton = new FullscreenButton(920, 25, 65, 100);
            this.components.push(this._fullscreenButton);
        }
        
        this.setLevelHasLoaded(false);
    }
    
    /**
     * Prepares the HUD before the level starts (triggers the same on any HUD components)
     */
    prepare():void
    {
        super.prepare();
        
        this.pointerEventManager.addPointerEventSubject(
            (x, y) => this._continueButton.isPointerOverlapping(x, y),
            () => this._continueButton.active,
            () => this._continueButton.onClick(),
            () => this._continueButton.onHover(),
            true
        );
        
        if(this._fullscreenButton)
            this.pointerEventManager.addPointerEventSubject(
                (x, y) => this._fullscreenButton.isPointerOverlapping(x, y),
                () => this._fullscreenButton.active,
                () => this._fullscreenButton.onClick(),
                null,
                true
            );
    }
    
    /**
     * Tells the HUD if the next level has finished loading (so it can activate/deactivate components)
     * @param hasLoaded Has the level finished loading?
     */
    setLevelHasLoaded(hasLoaded:boolean)
    {
        this._loadingTextDisplay.active = !hasLoaded;
        this._continueButton.active = hasLoaded;
    }
};