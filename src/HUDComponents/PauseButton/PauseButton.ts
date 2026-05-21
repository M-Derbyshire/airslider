import IAssetHandler from "../../../Kernel/AssetHandler/IAssetHandler";
import IGraphicEngine from "../../../Kernel/engines/GraphicEngine/IGraphicEngine";
import { GameLoopStatus } from "../../../Kernel/GameLoopManager/IGameLoopManager";
import Kernel from "../../../Kernel/Kernel";
import ASHUDComponent from "../ASHUDComponent/ASHUDComponent"

/**
 * Displays a pause/play button
 */
export default class PauseButton extends ASHUDComponent {
    
    /**
     * The spritesheet image that contains the different buttons
     */
    private _imageSheet!:HTMLImageElement;
    
    /**
     * Constructor
     * @param x the x position (in units)
     * @param y the y position (in units)
     * @param width the width (in units)
     * @param height the height (in units)
     */
    constructor(x:number, y:number, width:number, height:number)
    {
        super();
        
        this.active = true;
        
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    /**
     * Loads the component
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    load(assetHandler:IAssetHandler):void
    {
        super.load(assetHandler);
        
        this._imageSheet = assetHandler.loadImage("/HUDComponents/PauseButton/images/button_sheet.png");
    }
    
    /**
     * Draws the component
     * @param graphicEngine the graphic engine for the level
     * @param canvasContext the 2D context from the HTML canvas element
     */
    draw(graphicEngine:IGraphicEngine, canvasContext:CanvasRenderingContext2D):void
    {
        super.draw(graphicEngine, canvasContext);
        
        const kernel = Kernel.getInstance();
        
        /**
         * The source image should contain multiple button images, stacked vertically.
         * We use these values to select the right section of the source image.
         */
        const buttonSourceDiameter = 190;
        const pauseButtonSourceYPx = 0;
        const playButtonSourceYPx = buttonSourceDiameter;
        
        const sourceYPx = (kernel.status === GameLoopStatus.Active) ? pauseButtonSourceYPx : playButtonSourceYPx;
        
        // The positions/sizes to actually draw the sprite with
        const { x, y, width, height } = graphicEngine.getStaticDrawPositionsAndDimensions({
            x: this.x, 
            y: this.y, 
            width: this.width, 
            height: this.height
        });
        
        canvasContext.drawImage(
            this._imageSheet,
            0,
            sourceYPx,
            buttonSourceDiameter,
            buttonSourceDiameter,
            x,
            y,
            width,
            height
        );
    }
    
    /**
     * Handles the component being clicked
     */
    onClick()
    {
        Kernel.getInstance().toggleGamePause();
    }
};