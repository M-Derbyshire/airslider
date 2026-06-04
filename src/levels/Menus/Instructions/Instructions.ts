import IAssetHandler from "../../../../Kernel/AssetHandler/IAssetHandler";
import FrameManager from "../../../../Kernel/engines/GraphicEngine/FrameManager";
import IFrameManager from "../../../../Kernel/engines/GraphicEngine/IFrameManager";
import IGraphicEngine from "../../../../Kernel/engines/GraphicEngine/IGraphicEngine";
import IKeyboardEventManager from "../../../../Kernel/entities/Level/IKeyboardEventManager";
import IModelEventManager from "../../../../Kernel/entities/Level/IModelEventManager";
import IPointerEventManager from "../../../../Kernel/entities/Level/IPointerEventManager";
import KeyboardEventManager from "../../../../Kernel/entities/Level/KeyboardEventManager";
import ModelEventManager from "../../../../Kernel/entities/Level/ModelEventManager";
import PointerEventManager from "../../../../Kernel/entities/Level/PointerEventManager";
import Kernel from "../../../../Kernel/Kernel";
import InstructionsHUD from "../../../HUDs/InstructionsHUD/InstructionsHUD";
import ASMenu from "../../ASMenu/ASMenu";
import ForurnLoadingScreen from "../../LoadingScreens/ForurnLoadingScreen/ForurnLoadingScreen";

/**
 * A menu screen that displays the gameplay instructions
 */
export default class Instructions extends ASMenu
{
    private _arrowKeysImage!:HTMLImageElement; // Image of left/right arrow keys
    private _spacebarImage!:HTMLImageElement; // Image of a spacebar key

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

        this.HUD = new InstructionsHUD(pointerEventManager);
    }

    /**
     * Loads the level's assets
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    load(assetHandler:IAssetHandler):void
    {   
        super.load(assetHandler);
        
        this._arrowKeysImage = assetHandler.loadImage("/levels/Menus/Instructions/images/arrow_keys.png");
        this._spacebarImage = assetHandler.loadImage("/levels/Menus/Instructions/images/spacebar.png");
    }

    /**
     * Prepares the level, before the gameplay starts
     */
    prepare()
    {
        super.prepare();

        const kernel = Kernel.getInstance();

        kernel.loadLevel(new ForurnLoadingScreen(
            new FrameManager(),
            new ModelEventManager(),
            new PointerEventManager(kernel.canvasContext.canvas),
            new KeyboardEventManager()
        ));
    }

    /**
     * Draws anything that needs to be in the back (behind the models) of the level
     * @param graphicEngine the graphic engine for the level
     * @param canvasContext the 2D context from the HTML canvas element
     */
    drawBack(graphicEngine: IGraphicEngine, canvasContext: CanvasRenderingContext2D): void
    {
        super.drawBack(graphicEngine, canvasContext);

        this._drawStaticImageWithCenteredXPosition(
            this._arrowKeysImage,
            220,
            150,
            100,
            graphicEngine,
            canvasContext
        );

        this._drawStaticImageWithCenteredXPosition(
            this._spacebarImage,
            525,
            250,
            75,
            graphicEngine,
            canvasContext
        );
    }

    /**
     * Draws the given image to the screen (no scaling applied), centered on the X-axis
     * @param image the image to draw
     * @param yUnits the Y-axis value (in units) to use when drawing the image
     * @param widthUnits the width value (in units) to use when drawing the image
     * @param heightUnits the height value (in units) to use when drawing the image
     * @param graphicEngine the graphic engine for the level
     * @param canvasContext the 2D context from the HTML canvas element
     */
    private _drawStaticImageWithCenteredXPosition(
        image:HTMLImageElement,
        yUnits:number,
        widthUnits:number,
        heightUnits:number,
        graphicEngine: IGraphicEngine,
        canvasContext: CanvasRenderingContext2D
    )
    {
        const xUnits =
            (graphicEngine.camera.unitsWithinCameraX / 2) - (widthUnits / 2); // put the X center of the image in the center of the screen
        
        const { x, y, width, height } = graphicEngine.getStaticDrawPositionsAndDimensions({
            x: xUnits,
            y: yUnits,
            width: widthUnits,
            height: heightUnits
        });

        canvasContext.drawImage(image, x, y, width, height);
    }
};