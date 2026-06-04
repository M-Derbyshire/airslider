import IAssetHandler from "../../../../Kernel/AssetHandler/IAssetHandler";
import IFrameManager from "../../../../Kernel/engines/GraphicEngine/IFrameManager";
import IGraphicEngine from "../../../../Kernel/engines/GraphicEngine/IGraphicEngine";
import IKeyboardEventManager from "../../../../Kernel/entities/Level/IKeyboardEventManager";
import IModelEventManager from "../../../../Kernel/entities/Level/IModelEventManager";
import IPointerEventManager from "../../../../Kernel/entities/Level/IPointerEventManager";
import MainMenuHUD from "../../../HUDs/MainMenuHUD/MainMenuHUD";
import ASMenu from "../../ASMenu/ASMenu";

/**
 * The main menu for the game
 */
export default class MainMenu extends ASMenu
{
    private _logo!:HTMLImageElement;

    /**
     * Constructor
     * @param frameManager The frame manager for the level
     * @param modelEventManager Manages the event monitoring between models
     * @param pointerEventManager Manages any events relating to mouse clicks
     * @param keyboardEventManager Manages any keyboard events
     */
    constructor(
        frameManager:IFrameManager,
        modelEventManager:IModelEventManager,
        pointerEventManager:IPointerEventManager,
        keyboardEventManager:IKeyboardEventManager
    )
    {
        super(frameManager, modelEventManager, pointerEventManager, keyboardEventManager);

        this.HUD = new MainMenuHUD(pointerEventManager);
    }

    /**
     * Loads the level's assets
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    load(assetHandler:IAssetHandler):void
    {   
        super.load(assetHandler);
        this._logo = assetHandler.loadImage("/levels/Menus/MainMenu/images/logo.png");
    }

    /**
     * Draws anything that needs to be in the back (behind the models) of the level
     * @param graphicEngine the graphic engine for the level
     * @param canvasContext the 2D context from the HTML canvas element
     */
    drawBack(graphicEngine: IGraphicEngine, canvasContext: CanvasRenderingContext2D): void
    {
        super.drawBack(graphicEngine, canvasContext);

        const widthUnits = 250;
        const xUnits =
            (graphicEngine.camera.unitsWithinCameraX / 2) - (widthUnits / 2); // put the X center of the image in the center of the screen

        const { x, y, width, height } = graphicEngine.getStaticDrawPositionsAndDimensions({
            x: xUnits,
            y: graphicEngine.camera.unitsWithinCameraY / 4,
            width: widthUnits,
            height: 135
        });

        canvasContext.drawImage(this._logo, x, y, width, height);
    }
}