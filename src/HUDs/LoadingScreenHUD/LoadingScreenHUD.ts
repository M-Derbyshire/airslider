import ASHUD from "../ASHUD/ASHUD";
import TextOnly from "../../HUDComponents/UI-Components/TextOnly/TextOnly";
import TextButton from "../../HUDComponents/UI-Components/TextButton/TextButton";
import IHUDComponent from "../../../Kernel/entities/HUDComponent/IHUDComponent";
import Kernel from "../../../Kernel/Kernel";

/**
 * HUD for all the loading screens
 */
export default class LoadingScreenHUD extends ASHUD
{
    private _loadingTextDisplay:IHUDComponent; // The "Loading..." text component
    private _continueButton:IHUDComponent; // The button used to start the loaded level
    
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
        
        this.setLevelHasLoaded(false);
    }
    
    /**
     * Prepares the HUD before the level starts (triggers the same on any HUD components)
     */
    prepare():void
    {
        super.prepare();
        
        this.pointerEventManager.addPointerEventSubject(this._continueButton);
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