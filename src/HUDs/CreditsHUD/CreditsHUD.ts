import ASHUD from "../ASHUD/ASHUD";
import TextOnly from "../../HUDComponents/UI-Components/TextOnly/TextOnly";
import FullscreenHelper from "../../../Kernel/utils/FullscreenHelper";
import FullscreenButton from "../../HUDComponents/FullscreenButton/FullscreenButton";
import IPointerEventManager from "../../../Kernel/entities/Level/IPointerEventManager";
import Kernel from "../../../Kernel/Kernel";
import FrameManager from "../../../Kernel/engines/GraphicEngine/FrameManager";
import ModelEventManager from "../../../Kernel/entities/Level/ModelEventManager";
import PointerEventManager from "../../../Kernel/entities/Level/PointerEventManager";
import KeyboardEventManager from "../../../Kernel/entities/Level/KeyboardEventManager";
import TextButton from "../../HUDComponents/UI-Components/TextButton/TextButton";
import MainMenu from "../../levels/Menus/MainMenu/MainMenu";

/**
 * A HUD for the credits screen
 */
export default class CreditsHUD extends ASHUD
{
    private _fullscreenButton:FullscreenButton|null; // The fullscreen toggle button (if the feature is available)
    private _backButton:TextButton; // The button to take you back to the main menu
    
    /**
     * Constructor
     * @param pointerEventManager the level's PointerEventManager
     */
    constructor(pointerEventManager:IPointerEventManager)
    {
        super(pointerEventManager);
        
        const fontName = "Arial";
        const fontColor = "white";
        const fontStyle = "bold";
        const fontAlign = "center";
        const fontSize = 25;
        const lineGap = 10;
        
        const devText = new TextOnly(
            `Designed and Developed by:
Matthew Stuart Derbyshire`,
            500,
            450,
            fontSize,
            fontName,
            fontColor,
            fontStyle,
            fontAlign,
            lineGap
        );

        this._backButton = new TextButton(
            () => Kernel.getInstance().unloadCurrentLevel(),
            25,
            25,
            80,
            75,
            "Back",
            40
        );
        
        this.components.push(
            devText,
            this._backButton
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

        const kernel = Kernel.getInstance();

        kernel.loadLevel(new MainMenu(
            new FrameManager(),
            new ModelEventManager(),
            new PointerEventManager(kernel.canvasContext.canvas),
            new KeyboardEventManager()
        ));

        this.pointerEventManager.addPointerEventSubject(
            (x, y) => this._backButton.isPointerOverlapping(x, y, kernel.graphicEngine),
            () => this._backButton.active,
            () => this._backButton.onClick(),
            () => this._backButton.onHover(),
            true
        );
        
        if(this._fullscreenButton)
            this.pointerEventManager.addPointerEventSubject(
                (x, y) => this._fullscreenButton!.isPointerOverlapping(x, y, kernel.graphicEngine),
                () => this._fullscreenButton!.active,
                () => this._fullscreenButton!.onClick(),
                undefined,
                true
            );
    }
};