import ASHUD from "../ASHUD/ASHUD";
import TextOnlyButton from "../../HUDComponents/UI-Components/TextOnlyButton/TextOnlyButton";
import TextOnly from "../../HUDComponents/UI-Components/TextOnly/TextOnly";
import FullscreenHelper from "../../../Kernel/utils/FullscreenHelper";
import FullscreenButton from "../../HUDComponents/FullscreenButton/FullscreenButton";
import IPointerEventManager from "../../../Kernel/entities/Level/IPointerEventManager";
import ISoundEngine from "../../../Kernel/engines/SoundEngine/ISoundEngine";

/**
 * Displays text for a warning screen
 */
export default class WarningScreenTexts extends ASHUD
{
    private _continueButton:TextOnlyButton;
    private _fullscreenButton:FullscreenButton|null; // The fullscreen toggle button (if the feature is available)
    
    /**
     * Constructor
     * @param pointerEventManager the level's PointerEventManager
     * @param titleText the title for the warning
     * @param bodyText the body of the warning
     * @param continueText the text to be clicked by the player to continue
     * @param textColor the color of the text to display
     * @param onContinue a callback that will be called when the user clicks to continue
     */
    constructor(
        pointerEventManager:IPointerEventManager,
        titleText:string, 
        bodyText:string, 
        continueText:string,
        textColor:string, 
        onContinue:()=>void
    )
    {
        super(pointerEventManager);
        
        const fontName = "Arial";
        
        const title = new TextOnly(
            titleText,
            500,
            100,
            50,
            fontName,
            textColor,
            "bold",
            "center"
        );
        
        const body = new TextOnly(
            bodyText,
            500,
            250,
            25,
            fontName,
            textColor,
            "bold",
            "center",
            20
        );
        
        this._continueButton = new TextOnlyButton(
            onContinue,
            375,
            800,
            250,
            50,
            continueText,
            25,
            fontName,
            textColor,
            "bold",
            false
        );
        
        this.components = [
            title,
            body,
            this._continueButton
        ];
        
        this._fullscreenButton = null;
        if(FullscreenHelper.isFeatureAvailable())
        {
            this._fullscreenButton = new FullscreenButton(920, 25, 65, 100);
            this.components.push(this._fullscreenButton);
        }
    }
    
    /**
     * Prepares the HUD before the level starts (triggers the same on any HUD components)
     * @param soundEngine the sound engine for the level
     */
    prepare(soundEngine:ISoundEngine):void
    {
        super.prepare(soundEngine);
        
        this.pointerEventManager.addPointerEventSubject(
            (x, y) => this._continueButton.isPointerOverlapping(x, y),
            () => this._continueButton.active,
            () => this._continueButton.onClick(),
            null,
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
};