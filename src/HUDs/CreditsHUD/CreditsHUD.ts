import ASHUD from "../ASHUD/ASHUD";
import TextOnly from "../../HUDComponents/UI-Components/TextOnly/TextOnly";
import IHUDComponent from "../../../Kernel/entities/HUDComponent/IHUDComponent";
import FullscreenHelper from "../../../Kernel/utils/FullscreenHelper";
import FullscreenButton from "../../HUDComponents/FullscreenButton/FullscreenButton";

/**
 * A HUD for the credits screen
 */
export default class CreditsHUD extends ASHUD
{
    private _fullscreenButton:IHUDComponent|null; // The fullscreen toggle button (if the feature is available)
    
    constructor()
    {
        super();
        
        const fontName = "Arial";
        const fontColor = "white";
        const fontStyle = "bold";
        const fontAlign = "center";
        const fontSize = 25;
        const lineGap = 10;
        
        const devText = new TextOnly(
            `Designed/Developed by:
Matthew Stuart Derbyshire`,
            500,
            100,
            fontSize,
            fontName,
            fontColor,
            fontStyle,
            fontAlign,
            lineGap
        );
        
        const testersText = new TextOnly(
            `Playtesters:
Name 1
Name 2
Name 3`,
            500,
            250,
            fontSize,
            fontName,
            fontColor,
            fontStyle,
            fontAlign,
            lineGap
        );
        
        const fontTitle = new TextOnly(
            `Fonts Used:`,
            500,
            470,
            fontSize * 1.5,
            fontName,
            fontColor,
            fontStyle,
            fontAlign
        );
        
        const courierPrimeFont = new TextOnly(
            `Courier Prime:
Copyright 2015 The Courier Prime Project Authors (https://github.com/quoteunquoteapps/CourierPrime).
This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org`,
            500,
            525,
            fontSize * 0.75,
            fontName,
            fontColor,
            fontStyle,
            fontAlign,
            lineGap
        );
        
        const jostFont = new TextOnly(
            `Jost:
Copyright 2020 The Jost Project Authors (https://github.com/indestructible-type)
This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL`,
            500,
            700,
            fontSize * 0.75,
            fontName,
            fontColor,
            fontStyle,
            fontAlign,
            lineGap
        );
        
        this.components.push(
            devText,
            testersText,
            fontTitle,
            courierPrimeFont,
            jostFont
        );
        
        this._fullscreenButton = null;
        if(FullscreenHelper.isFeatureAvailable())
        {
            this._fullscreenButton = new FullscreenButton(920, 25, 65, 100);
            this.components.push(this._fullscreenButton);
        }
    }
    
    /**
     * Prepares the HUD before the level starts (triggers the same on any HUD components)
     */
    prepare():void
    {
        super.prepare();
        
        if(this._fullscreenButton)
            this.pointerEventManager.addPointerEventSubject(this._fullscreenButton);
    }
};