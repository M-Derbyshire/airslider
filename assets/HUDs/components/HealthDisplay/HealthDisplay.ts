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
        this._drawSpannerBackground(radiusModifierPixels);
        this._drawTextBackground(radiusModifierPixels);
        this.ctx.globalAlpha = 1;
        
        this._drawSpanner();
        this._drawBorder();
        
        this._setText(health);
    }
    
    /**
     * Draws the background behind the spanner image
     * @param radiusModifierPixels The pixel value for the radius of the background's corners
     */
    private _drawSpannerBackground(radiusModifierPixels:number)
    {
        const width = this.width * 0.33;
        
        const { drawX, drawY, drawWidth, drawHeight } = this.getScreenDrawCoordinates(this.x, this.y, width, this.height);
        
        this.ctx.beginPath();
        this.ctx.roundRect(drawX, drawY, drawWidth, drawHeight, radiusModifierPixels);
        this.ctx.fill();
    }
    
    /**
     * Draws the background behind the health text
     * @param radiusModifierPixels The pixel value for the radius of the background's corners
     */
    private _drawTextBackground(radiusModifierPixels:number)
    {
        const width = this.width * 0.66;
        const height = this.height * 0.5;
        
        const xPos = this.x + (this.width * 0.33);
        const yPos = this.y + (this.height * 0.25);
        
        const { drawX, drawY, drawWidth, drawHeight } = this.getScreenDrawCoordinates(xPos, yPos, width, height);
        
        // We only want a radius on the right side, as the left is connected to the spanner background
        const radiusModifiers = [
            0,
            radiusModifierPixels,
            radiusModifierPixels,
            0
        ];
        
        this.ctx.beginPath();
        this.ctx.roundRect(drawX, drawY, drawWidth, drawHeight, radiusModifiers);
        this.ctx.fill();
    }
    
    /**
     * Draws the spanner image
     */
    private _drawSpanner()
    {
        const xPaddingUnits = 10; // Padding between the image and the border, on the x-axis
        const yPaddingUnits = 20; // Padding between the image and the border, on the y-axis
        
        const xPos = this.x + xPaddingUnits;
        const yPos = this.y + yPaddingUnits
        const width = (this.width * 0.33) - (xPaddingUnits * 2);
        const height = this.height - (yPaddingUnits * 2)
        
        const { drawX, drawY, drawWidth, drawHeight } = this.getScreenDrawCoordinates(xPos, yPos, width, height);
        
        this.ctx.drawImage(this._spannerImage, drawX, drawY, drawWidth, drawHeight);
    }
    
    /**
     * Draws the border image over the component
     */
    private _drawBorder()
    {
        const paddingUnits = 5; // Used to push the border out a bit
        
        const xPos = this.x - paddingUnits;
        const yPos = this.y - paddingUnits;
        const width = this.width + (paddingUnits * 2);
        const height = this.height + (paddingUnits * 2);
        
        const { drawX, drawY, drawWidth, drawHeight } = this.getScreenDrawCoordinates(xPos, yPos, width, height);
        
        this.ctx.drawImage(this._borderImage, drawX, drawY, drawWidth, drawHeight);
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