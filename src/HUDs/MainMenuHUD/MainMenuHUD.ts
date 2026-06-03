import FrameManager from "../../../Kernel/engines/GraphicEngine/FrameManager";
import IPointerEventManager from "../../../Kernel/entities/Level/IPointerEventManager";
import KeyboardEventManager from "../../../Kernel/entities/Level/KeyboardEventManager";
import ModelEventManager from "../../../Kernel/entities/Level/ModelEventManager";
import PointerEventManager from "../../../Kernel/entities/Level/PointerEventManager";
import Kernel from "../../../Kernel/Kernel";
import FullscreenHelper from "../../../Kernel/utils/FullscreenHelper";
import FullscreenButton from "../../HUDComponents/FullscreenButton/FullscreenButton";
import TextButton from "../../HUDComponents/UI-Components/TextButton/TextButton";
import Credits from "../../levels/Menus/Credits/Credits";
import Instructions from "../../levels/Menus/Instructions/Instructions";
import ASHUD from "../ASHUD/ASHUD";

/**
 * The HUD for the Main Menu
 */
export default class MainMenuHUD extends ASHUD
{
    private _startButton:TextButton; // The button that takes you to the instructions screen
    private _creditsButton:TextButton; // The button that takes you to the credits screen
    private _fullscreenButton?:FullscreenButton; // The button that toggles the fullscreen setting

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
            () => {
                kernel.loadLevel(new Instructions(
                    new FrameManager(),
                    new ModelEventManager(),
                    new PointerEventManager(kernel.canvasContext.canvas),
                    new KeyboardEventManager()
                ));

                kernel.unloadCurrentLevel();
            },
            buttonX,
            500,
            buttonWidth,
            buttonHeight,
            "Play",
            buttonFontSize
        );

        this._creditsButton = new TextButton(
            () => {
                kernel.loadLevel(new Credits(
                    new FrameManager(),
                    new ModelEventManager(),
                    new PointerEventManager(kernel.canvasContext.canvas),
                    new KeyboardEventManager()
                ));
                
                kernel.unloadCurrentLevel();
            },
            buttonX,
            650,
            buttonWidth,
            buttonHeight,
            "Credits",
            buttonFontSize
        );

        this.components.push(this._startButton, this._creditsButton);

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

        this.pointerEventManager.addPointerEventSubject(
            (x, y) => this._startButton.isPointerOverlapping(x, y, kernel.graphicEngine),
            () => this._startButton.active,
            () => this._startButton.onClick(),
            undefined,
            true
        );

        this.pointerEventManager.addPointerEventSubject(
            (x, y) => this._creditsButton.isPointerOverlapping(x, y, kernel.graphicEngine),
            () => this._creditsButton.active,
            () => this._creditsButton.onClick(),
            undefined,
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