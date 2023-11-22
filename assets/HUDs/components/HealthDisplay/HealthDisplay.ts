import ICamera from '../../../../engines/GraphicEn/ICamera';
import Tarian from '../../../models/Tarian/Tarian';
import ASHUDComponent from '../ASHUDComponent/ASHUDComponent';

/**
 * Displays the player's health
 */
export default class HealthDisplay extends ASHUDComponent
{   
    // There are different colors for different levels of health
    private _highHealthColor = "#267F00";
    private _midHealthColor = "#C5CC00";
    private _lowHealthColor = "#D80000";
    
    /**
     * The border image for the component
     */
    private _borderImage:HTMLImageElement;
    
    /**
     * The spanner image
     */
    private _spannerImage:HTMLImageElement;
    
    /**
     * Affects the radius of the rectangle's corners
     */
    private _cornerRadiusModifier:number;
    
    /**
     * The index of the player model in the models array
     */
    private _targetIndex:number;
    
    /**
     * Constructor
     * @param x the x position (in units) of the health display
     * @param y the y position (in units) of the health display
     * @param width the width (in units) of the health display
     * @param height the height (in units) of the health display
     * @param targetModelIndex The index of the player model in the models array
     */
    constructor(x:number, y:number, width:number, height:number, targetModelIndex:number)
    {
        super();
        
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        this._targetIndex = targetModelIndex;
        
        this._cornerRadiusModifier = 5;
    }
    
    load(camera:ICamera):void
    {
        super.load(camera);
        
        const imagesDirPath = "/assets/HUDs/components/HealthDisplay/images";
        this._borderImage = this.kernel.loadImage(`${imagesDirPath}/lightning-border.png`);
        this._spannerImage = this.kernel.loadImage(`${imagesDirPath}/spanner.png`);
    }
    
    prepare():void {
        super.prepare();
        
        // Setup the text positions/dimensions
        this.text = {
            content: "",
            x: this.x + (this.width * 0.4),
            y: this.y + (this.height * 0.6),
            size: 65,
            font: "Jost",
            color: "#00FFFA",
            style: ""
        }
    }
    
    draw():void
    {
        const health = (this.kernel.loadedModels[this._targetIndex] as unknown as Tarian).health;
        const cameraX = this.camera.canvasPositionX;
        const cameraY = this.camera.canvasPositionY;
		const radiusModifierPixels = this.helpers.unit.xUnit(this._cornerRadiusModifier);
        
        // Determine the background color, based on the health
        let color:string;
        
        if(health > 50)
            color = this._highHealthColor;
        else if(health > 15)
            color = this._midHealthColor;
        else
            color = this._lowHealthColor;
        
        this.ctx.globalAlpha = 0.5;
        this.ctx.fillStyle = color;
        this._drawSpannerBackground(cameraX, cameraY, radiusModifierPixels);
        this._drawTextBackground(cameraX, cameraY, radiusModifierPixels);
        this.ctx.globalAlpha = 1;
        
        this._drawSpanner(cameraX, cameraY);
        this._drawBorder(cameraX, cameraY);
        
        this._setText(health);
    }
    
    /**
     * Draws the background behind the spanner image
     * @param cameraX the current x position of the camera on the canvas
     * @param cameraY the current y position of the camera on the canvas
     * @param radiusModifierPixels The pixel value for the radius of the background's corners
     */
    private _drawSpannerBackground(cameraX:number, cameraY:number, radiusModifierPixels:number)
    {
        const width = this.width * 0.33;
        
        this.ctx.beginPath();
        this.ctx.roundRect(
            cameraX + this.helpers.unit.xUnit(this.x),
            cameraY + this.helpers.unit.yUnit(this.y),
            this.helpers.unit.xUnit(width),
            this.helpers.unit.yUnit(this.height),
            radiusModifierPixels
        );
        this.ctx.fill();
    }
    
    /**
     * Draws the background behind the health text
     * @param cameraX the current x position of the camera on the canvas
     * @param cameraY the current y position of the camera on the canvas
     * @param radiusModifierPixels The pixel value for the radius of the background's corners
     */
    private _drawTextBackground(cameraX:number, cameraY:number, radiusModifierPixels:number)
    {
        const width = this.width * 0.66;
        const height = this.height * 0.5;
        
        const xPos = this.x + (this.width * 0.33);
        const yPos = this.y + (this.height * 0.25);
        
        // We only want a radius on the right side, as the left is connected to the spanner background
        const radiusModifiers = [
            0,
            radiusModifierPixels,
            radiusModifierPixels,
            0
        ];
        
        this.ctx.beginPath();
        this.ctx.roundRect(
            cameraX + this.helpers.unit.xUnit(xPos),
            cameraY + this.helpers.unit.yUnit(yPos),
            this.helpers.unit.xUnit(width),
            this.helpers.unit.yUnit(height),
            radiusModifiers
        );
        this.ctx.fill();
    }
    
    /**
     * Draws the spanner image
     * @param cameraX the current x position of the camera on the canvas
     * @param cameraY the current y position of the camera on the canvas
     */
    private _drawSpanner(cameraX:number, cameraY:number)
    {
        const xPaddingUnits = 10; // Padding between the image and the border, on the x-axis
        const yPaddingUnits = 20; // Padding between the image and the border, on the y-axis
        
        this.ctx.drawImage(
            this._spannerImage,
            cameraX + this.helpers.unit.xUnit(this.x + xPaddingUnits),
            cameraY + this.helpers.unit.yUnit(this.y + yPaddingUnits),
            this.helpers.unit.xUnit((this.width * 0.33) - (xPaddingUnits * 2)),
            this.helpers.unit.yUnit(this.height - (yPaddingUnits * 2))
        );
    }
    
    /**
     * Draws the border image over the component
     * @param cameraX the current x position of the camera on the canvas
     * @param cameraY the current y position of the camera on the canvas
     */
    private _drawBorder(cameraX:number, cameraY:number)
    {
        const paddingUnits = 5; // Used to push the border out a bit
        
        this.ctx.drawImage(
            this._borderImage, 
            cameraX + this.helpers.unit.xUnit(this.x - paddingUnits),
            cameraY + this.helpers.unit.yUnit(this.y - paddingUnits),
            this.helpers.unit.xUnit(this.width + (paddingUnits * 2)), 
            this.helpers.unit.yUnit(this.height + (paddingUnits * 2))
        );
    }
    
    /**
     * Sets the health value text
     * @param health the current health value
     */
    private _setText(health:number)
    {
        this.text.content = `${Math.round(health)}%`;
    }
}