import { KernelStatus } from "../../../../Kernel/KernelStatus";
import ICamera from "../../../../engines/GraphicEn/ICamera";
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
    
    load(camera:ICamera):void 
    {
        super.load(camera);
        this._imageSheet = this.kernel.loadImage("/assets/HUDs/components/PauseButton/images/button_sheet.png");
    }
    
    draw()
    {
        super.draw();
        
        /**
         * The source image should contain multiple button images, stacked vertically.
         * We use these values to select the right section of the source image.
         */
        const buttonSourceDiameter = 190;
        const pauseButtonSourceYPx = 0;
        const playButtonSourceYPx = buttonSourceDiameter;
        
        const sourceYPx = (this.kernel.status === KernelStatus.Active) ? pauseButtonSourceYPx : playButtonSourceYPx;
        
        // The positions/sizes to actually draw the sprite with
        const { drawX, drawY, drawWidth, drawHeight } = this._getDrawPositionsAndDimensions();
        
        this.ctx.drawImage(
            this._imageSheet,
            0,
            sourceYPx,
            buttonSourceDiameter,
            buttonSourceDiameter,
            drawX,
            drawY,
            drawWidth,
            drawHeight
        );
    }
    
    /**
     * Determines the actual pixel values for x/y/width/height, to be used when drawing the image
     * @returns An object that contains the x/y/width/height to draw the sprite on canvas
     */
    private _getDrawPositionsAndDimensions():{ drawX:number, drawY:number, drawWidth:number, drawHeight:number }
    {
        const cameraX = this.camera.canvasPositionX;
        const cameraY = this.camera.canvasPositionY;
        
        return {
            drawX: cameraX + this.helpers.unit.xUnit(this.x),
            drawY: cameraY + this.helpers.unit.yUnit(this.y),
            drawWidth: this.helpers.unit.xUnit(this.width),
            drawHeight: this.helpers.unit.yUnit(this.height)
        };
    }
    
    /**
     * Is the mouse pointer overlapping this component?
     * @param pointX the x position (within the canvas's space) of the mouse pointer 
     * @param pointY the y position (within the canvas's space) of the mouse pointer
     * @returns true if it is overlapping, false if not
     */
    isPointerOverlapping(pointX:number, pointY:number):boolean
    {
        const { drawX, drawY, drawWidth, drawHeight } = this._getDrawPositionsAndDimensions();
        
        return (
            pointX >= drawX &&
            pointY >= drawY &&
            pointX <= (drawX + drawWidth) &&
            pointY <= (drawY + drawHeight)
        );
    }
    
    /**
     * Handles the component being clicked
     */
    onClick()
    {
        this.kernel.toggleGamePause();
    }
};