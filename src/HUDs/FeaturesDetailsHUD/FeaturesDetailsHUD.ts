import ASHUD from "../ASHUD/ASHUD";
import TextOnly from "../../HUDComponents/UI-Components/TextOnly/TextOnly";
import FullscreenButton from "../../HUDComponents/FullscreenButton/FullscreenButton";
import TextOnlyButton from "../../HUDComponents/UI-Components/TextOnlyButton/TextOnlyButton";
import IPointerEventManager from "../../../Kernel/entities/Level/IPointerEventManager";
import Kernel from "../../../Kernel/Kernel";

/**
 * A HUD for the feature-details screen
 */
export default class FeaturesDetailsHUD extends ASHUD
{
    private _fullscreenButton:FullscreenButton; // The fullscreen toggle button
    private _continueButton:TextOnlyButton; // Used to move on to the next level/menu
    
    /**
     * Constructor
     * @param pointerEventManager the level's PointerEventManager
     * @param onContinue a callback that will be called when the user clicks to continue
     */
    constructor(pointerEventManager:IPointerEventManager, onContinue:()=>void)
    {
        super(pointerEventManager);
        
        const fontName = "Arial";
        const fontColor = "white";
        const fontStyle = "bold";
        const fontAlign = "center";
        const fontSize = 45;
        const lineGap = 10;
        
        const fullscreenModeText = new TextOnly(
            `You can enter fullscreen mode at any time, using the
fullscreen button in the top-right of the screen`,
            500,
            250,
            fontSize,
            fontName,
            fontColor,
            fontStyle,
            fontAlign,
            lineGap
        );
        
        this._continueButton = new TextOnlyButton(
            onContinue,
            375,
            800,
            250,
            50,
            "Click Here To Continue",
            25,
            fontName,
            fontColor,
            fontStyle,
            false
        );
        
        this._fullscreenButton = new FullscreenButton(920, 25, 65, 100)
        
        this.components.push(
            fullscreenModeText,
            this._continueButton,
            this._fullscreenButton
        );
    }
    
    /**
     * Prepares the HUD before the level starts (triggers the same on any HUD components)
     */
    prepare():void
    {
        super.prepare();
        
        const graphicEngine = Kernel.getInstance().graphicEngine;
        
        this.pointerEventManager.addPointerEventSubject(
            (x, y) => this._continueButton.isPointerOverlapping(x, y, graphicEngine),
            () => this._continueButton.active,
            () => this._continueButton.onClick(),
            undefined,
            true
        );
        
        this.pointerEventManager.addPointerEventSubject(
            (x, y) => this._fullscreenButton.isPointerOverlapping(x, y, graphicEngine),
            () => this._fullscreenButton.active,
            () => this._fullscreenButton.onClick(),
            undefined,
            true
        );
    }
};