import Kernel from '../../../../../Kernel/Kernel';
import TextOnlyButton from '../TextOnlyButton/TextOnlyButton';

/**
 * A HUDComponent that is a button with text
 */
export default class TextButton extends TextOnlyButton 
{
    private _backgroundColor:string; // The color of the button's background
    private _hoverBackgroundColor:string; // The background color of the button when the user is hovering over it
    
    private _isHovering:boolean; // Is the user hovering over this button?
    
    private _cornerRadiusModifier:number; // Affects the radius of the button's corners
    private _borderPiecesImage:HTMLImageElement; // An image containing the individual segments needed to build the border
    
    /**
     * Constructor
     * @param onClick a callbck to trigger when the player clicks this
     * @param x the x position (in units) of the button
     * @param y the y position (in units) of the button
     * @param width the width (in units) of the button
     * @param height the height (in units) of the button
     * @param text the text to display
     * @param fontSize the font size for the text
     */
	constructor(
        onClick:()=>void,
        x:number,
        y:number,
        width:number,
        height:number,
        text:string,
        fontSize:number
    )
	{
        const fontName = "Arial";
        const fontColor = "#11FFFF";
        const fontStyle = "bold";
        
		super(
            onClick,
            x,
            y,
            width,
            height,
            text,
            fontSize,
            fontName,
            fontColor,
            fontStyle,
            false
        );
        
        this._backgroundColor = "#267F00";
        this._hoverBackgroundColor = "#227300";
        this._cornerRadiusModifier = 15;
        this._isHovering = false;
	}
    
    /**
     * Loads the component
     */
    load():void 
    {
        super.load();
        
        this._borderPiecesImage = Kernel.getInstance().loadImage("/HUDs/components/UI-Components/TextButton/images/borderPieces.png");
    }
    
    /**
     * Draws the component
     */
    draw():void 
    {
        super.draw();
        
        this._drawBackground();
        this._drawBorder();
        
        // Reset the hovering flag (this will be set back to true on the next frame, if the user  
        // is still hovering)
        this._isHovering = false;
    }
    
    /**
     * Triggered if the player is hovering the pointer over the button
     */
    onHover()
    {
        this._isHovering = true;
    }
    
    /**
     * Draws the background of the button
     */
    private _drawBackground()
    {
        const kernel = Kernel.getInstance();
        const ctx = kernel.gameContext;
        
        const originalFillColor = ctx.fillStyle;
        ctx.fillStyle = (this._isHovering) ? this._hoverBackgroundColor : this._backgroundColor;
        
        const { x, y, width, height } = kernel.graphicEngine.getStaticDrawPositionsAndDimensions({ 
            x: this.x, 
            y: this.y, 
            width: this.width, 
            height: this.height
        });
        
        const cornerRadius = kernel.helpers.unit.xUnit(this._cornerRadiusModifier);
        
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, cornerRadius);
        ctx.fill();
        
        ctx.fillStyle = originalFillColor;
    }
    
    /**
     * Draws the border (with the different "pieces" of the border, in the loaded image)
     */
    private _drawBorder()
    {
        const ctx = Kernel.getInstance().gameContext;
        
        // First, we need to set the coordinates of each "piece" of the border, on the loaded image
        const horizLineCoord = { x: 0, y: 0, width: 187, height: 14 };
        const vertLineCoord = { x: 1, y: 18, width: 14, height: 62 };
        const topLeftCoord = { x: 24, y: 18 };
        const topRightCoord = { x: 61, y: 18 };
        const bottomLeftCoord = { x: 24, y: 52 };
        const bottomRightCoord = { x: 61, y: 52 };
        const cornerSquareSizeCoord = 27; // The width/height of the corners coordinates
        
        
        
        // Next, we need to determine the co-ordinates to draw all the required pieces (in pixels)
        const graphicEngine = Kernel.getInstance().graphicEngine;
        const getPixelValues = graphicEngine.getStaticDrawPositionsAndDimensions.bind(graphicEngine);
        
        const edgePixels = getPixelValues({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        });
        
        const cornerPixels = getPixelValues({
            width: cornerSquareSizeCoord,
            height: cornerSquareSizeCoord
        });
        
        const horizLineHeightPixels = getPixelValues({ height: horizLineCoord.height }).height;
        const vertLineWidthPixels = getPixelValues({ width: vertLineCoord.width }).width;
        
        // These are used to push the images out a bit, into the correct positions
        const borderXIndentUnits = 6;
        const borderTopIndentUnits = 10;
        const borderBottomIndentUnits = 5.5;
        
        const borderIndentPixels = { top: 0, bottom: 0, xAxis: 0 };
        borderIndentPixels.xAxis = getPixelValues({ width: borderXIndentUnits }).width;
        borderIndentPixels.top = getPixelValues({ height: borderTopIndentUnits }).height;
        borderIndentPixels.bottom = getPixelValues({ height: borderBottomIndentUnits }).height;
        
        
        
        // Now we can draw the images for the corners
        
        // Top left corner
        const topLeftX = edgePixels.x - borderIndentPixels.xAxis;
        const topLeftY = edgePixels.y - borderIndentPixels.top;
        ctx.drawImage(
            this._borderPiecesImage,
            topLeftCoord.x,
            topLeftCoord.y,
            cornerSquareSizeCoord,
            cornerSquareSizeCoord,
            topLeftX,
            topLeftY,
            cornerPixels.width,
            cornerPixels.height
        );
        
        // Top right corner
        const topRightX = edgePixels.x + edgePixels.width - cornerPixels.width + borderIndentPixels.xAxis;
        const topRightY = edgePixels.y - borderIndentPixels.top;
        ctx.drawImage(
            this._borderPiecesImage,
            topRightCoord.x,
            topRightCoord.y,
            cornerSquareSizeCoord,
            cornerSquareSizeCoord,
            topRightX,
            topRightY,
            cornerPixels.width,
            cornerPixels.height
        );
        
        // Bottom left corner
        const bottomLeftX = edgePixels.x - borderIndentPixels.xAxis;
        const bottomLeftY = edgePixels.y + edgePixels.height - cornerPixels.height + borderIndentPixels.bottom;
        ctx.drawImage(
            this._borderPiecesImage,
            bottomLeftCoord.x,
            bottomLeftCoord.y,
            cornerSquareSizeCoord,
            cornerSquareSizeCoord,
            bottomLeftX,
            bottomLeftY,
            cornerPixels.width,
            cornerPixels.height
        );
        
        // Bottom right corner
        const bottomRightX = edgePixels.x + edgePixels.width - cornerPixels.width + borderIndentPixels.xAxis;
        const bottomRightY = edgePixels.y + edgePixels.height - cornerPixels.height + borderIndentPixels.bottom;
        ctx.drawImage(
            this._borderPiecesImage,
            bottomRightCoord.x,
            bottomRightCoord.y,
            cornerSquareSizeCoord,
            cornerSquareSizeCoord,
            bottomRightX,
            bottomRightY,
            cornerPixels.width,
            cornerPixels.height
        );
        
        
        
        // Now draw the images for the lines
        
        const horizLineX = topLeftX + cornerPixels.width - 1;
        const horizLineWidth = topRightX - horizLineX + 1;
        const vertLineY = topLeftY + cornerPixels.height - 1;
        const vertLineHeight = bottomLeftY - vertLineY + 1;
        
        // Top line
        ctx.drawImage(
            this._borderPiecesImage,
            horizLineCoord.x,
            horizLineCoord.y,
            horizLineCoord.width,
            horizLineCoord.height,
            horizLineX,
            topLeftY,
            horizLineWidth,
            horizLineHeightPixels
        );
        
        // Bottom line
        ctx.drawImage(
            this._borderPiecesImage,
            horizLineCoord.x,
            horizLineCoord.y,
            horizLineCoord.width,
            horizLineCoord.height,
            horizLineX,
            bottomLeftY + cornerPixels.height - (horizLineHeightPixels * 1.05),
            horizLineWidth,
            horizLineHeightPixels
        );
        
        // Left line
        ctx.drawImage(
            this._borderPiecesImage,
            vertLineCoord.x,
            vertLineCoord.y,
            vertLineCoord.width,
            vertLineCoord.height,
            topLeftX,
            vertLineY,
            vertLineWidthPixels,
            vertLineHeight
        );
        
        // Right line
        ctx.drawImage(
            this._borderPiecesImage,
            vertLineCoord.x,
            vertLineCoord.y,
            vertLineCoord.width,
            vertLineCoord.height,
            topRightX + cornerPixels.width - (vertLineWidthPixels * 0.925),
            vertLineY,
            vertLineWidthPixels,
            vertLineHeight
        );
    }
}