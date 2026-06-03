import FrameManager from "../../../Kernel/engines/GraphicEngine/FrameManager";
import IPointerEventManager from "../../../Kernel/entities/Level/IPointerEventManager";
import KeyboardEventManager from "../../../Kernel/entities/Level/KeyboardEventManager";
import ModelEventManager from "../../../Kernel/entities/Level/ModelEventManager";
import PointerEventManager from "../../../Kernel/entities/Level/PointerEventManager";
import Kernel from "../../../Kernel/Kernel";
import FullscreenHelper from "../../../Kernel/utils/FullscreenHelper";
import FullscreenButton from "../../HUDComponents/FullscreenButton/FullscreenButton";
import TextButton from "../../HUDComponents/UI-Components/TextButton/TextButton";
import TextOnly from "../../HUDComponents/UI-Components/TextOnly/TextOnly";
import ForurnLoadingScreen from "../../levels/LoadingScreens/ForurnLoadingScreen/ForurnLoadingScreen";
import ASHUD from "../ASHUD/ASHUD";

export default class InstructionsHUD extends ASHUD
{
    private _fullscreenButton?:FullscreenButton; // The button that toggles the fullscreen setting
    private _startButton:TextButton; // The button to move to the first level's loading screen

    /**
     * Constructor
     * @param pointerEventManager the level's PointerEventManager
     */
    constructor(pointerEventManager:IPointerEventManager)
    {
        super(pointerEventManager);

        const kernel = Kernel.getInstance();

        const buttonWidth = 150;
        const buttonHeight = 75;
        const buttonX = 500 - (buttonWidth / 2);
        const buttonFontSize = 40;

        this._startButton = new TextButton(
            () => kernel.unloadCurrentLevel(),
            buttonX,
            750,
            buttonWidth,
            buttonHeight,
            "Start Game",
            buttonFontSize
        );

        const fontName = "Arial";
        const fontColor = "white";
        const fontStyle = "bold";
        const fontAlign = "center";
        const fontSize = 35;

        const arrowsText = new TextOnly(
            "Use the arrow keys to move left and right",
            500,
            180,
            fontSize,
            fontName,
            fontColor,
            fontStyle,
            fontAlign
        );

        const spacebarText = new TextOnly(
            "Use the spacebar to pause/resume the game",
            500,
            480,
            fontSize,
            fontName,
            fontColor,
            fontStyle,
            fontAlign
        );

        this.components.push(this._startButton, arrowsText, spacebarText);

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

        kernel.loadLevel(new ForurnLoadingScreen(
            new FrameManager(),
            new ModelEventManager(),
            new PointerEventManager(kernel.canvasContext.canvas),
            new KeyboardEventManager()
        ));

        this.pointerEventManager.addPointerEventSubject(
            (x, y) => this._startButton.isPointerOverlapping(x, y, kernel.graphicEngine),
            () => this._startButton.active,
            () => this._startButton.onClick(),
            () => this._startButton.onHover(),
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
}