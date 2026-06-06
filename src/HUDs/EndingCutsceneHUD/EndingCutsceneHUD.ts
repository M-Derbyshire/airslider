import HUD from "../../../Kernel/entities/HUD/HUD";
import IPointerEventManager from "../../../Kernel/entities/Level/IPointerEventManager";
import FullscreenButton from "../../HUDComponents/FullscreenButton/FullscreenButton";
import TextButton from "../../HUDComponents/UI-Components/TextButton/TextButton";
import Kernel from "../../../Kernel/Kernel";
import FullscreenHelper from "../../../Kernel/utils/FullscreenHelper";
import Credits from "../../levels/Menus/Credits/Credits";
import FrameManager from "../../../Kernel/engines/GraphicEngine/FrameManager";
import ModelEventManager from "../../../Kernel/entities/Level/ModelEventManager";
import PointerEventManager from "../../../Kernel/entities/Level/PointerEventManager";
import KeyboardEventManager from "../../../Kernel/entities/Level/KeyboardEventManager";

/**
 * The HUD for the ending cutscene
 */
export default class EndingCutsceneHUD extends HUD
{
    private _fullscreenButton:FullscreenButton|null; // The fullscreen toggle button (if the feature is available)
    private _creditsButton:TextButton; // The button to take you to the credits scene

    /**
     * Constructor
     * @param pointerEventManager the level's PointerEventManager
     */
    constructor(pointerEventManager:IPointerEventManager)
    {
        super(pointerEventManager);
        
        this._creditsButton = new TextButton(
            () => Kernel.getInstance().unloadCurrentLevel(),
            450,
            885,
            100,
            75,
            "Credits",
            40
        );
        
        this.components.push(this._creditsButton);

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

        kernel.loadLevel(new Credits(
            new FrameManager(),
            new ModelEventManager(),
            new PointerEventManager(kernel.canvasContext.canvas),
            new KeyboardEventManager()
        ));
        
        this.pointerEventManager.addPointerEventSubject(
            (x, y) => this._creditsButton.isPointerOverlapping(x, y, kernel.graphicEngine),
            () => this._creditsButton.active,
            () => this._creditsButton.onClick(),
            () => this._creditsButton.onHover(),
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

    /**
     * Disables the HUD's navigation components
     */
    disableNavigation():void
    {
        this._creditsButton.active = false;
    }

    /**
     * Enables the HUD's navigation components
     */
    enableNavigation():void
    {
        this._creditsButton.active = true;
    }
};