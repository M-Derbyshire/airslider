import Kernel from "../../../../Kernel/Kernel";
import { KernelStatus } from "../../../../Kernel/KernelStatus";
import ASHUDComponent from "../ASHUDComponent/ASHUDComponent"

/**
 * Displays a pause/play button
 */
export default class PauseButton extends ASHUDComponent {
    
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
    
    load():void 
    {
        super.load();
        this._imageSheet = Kernel.getInstance().loadImage("/assets/HUDs/components/PauseButton/images/button_sheet.png");
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
        const pauseButtonSourceYPx = 0;
        const playButtonSourceYPx = buttonSourceDiameter;
        
        const sourceYPx = (kernel.status === KernelStatus.Active) ? pauseButtonSourceYPx : playButtonSourceYPx;
        
        // The positions/sizes to actually draw the sprite with
        const { x, y, width, height } = kernel.graphicEngine.getStaticDrawPositionsAndDimensions({
            x: this.x, 
            y: this.y, 
            width: this.width, 
            height: this.height
        });
        
        kernel.gameContext.drawImage(
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