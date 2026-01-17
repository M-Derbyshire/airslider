import IAssetHandler from "../../../Kernel/AssetHandler/IAssetHandler";
import Kernel from "../../../Kernel/Kernel";
import FullscreenHelper from "../../../Kernel/utils/FullscreenHelper";
import ASHUDComponent from "../ASHUDComponent/ASHUDComponent"

/**
 * Displays a fullscreen toggle button
 */
export default class FullscreenButton extends ASHUDComponent {
    
    /**
     * The spritesheet image that contains the different buttons
     */
    private _imageSheet:HTMLImageElement;
    
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
        
        this._imageSheet = assetHandler.loadImage("/HUDComponents/FullscreenButton/images/button_sheet.png");
    }
    
    draw()
    {
        super.draw();
        
        const kernel = Kernel.getInstance();
        
        /**
         * The source image should contain multiple button images, stacked vertically.
         * We use these values to select the right section of the source image.
         */
        const buttonSourceDiameter = 190;
        const maximiseButtonSourceYPx = 0;
        const minimiseButtonSourceYPx = buttonSourceDiameter;
        
        const sourceYPx = FullscreenHelper.isFullscreen() ? minimiseButtonSourceYPx : maximiseButtonSourceYPx;
        
        // The positions/sizes to actually draw the sprite with
        const { x, y, width, height } = kernel.graphicEngine.getStaticDrawPositionsAndDimensions({
            x: this.x, 
            y: this.y, 
            width: this.width, 
            height: this.height
        });
        
        kernel.canvasContext.drawImage(
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
        FullscreenHelper.toggleFullscreen();
    }
};