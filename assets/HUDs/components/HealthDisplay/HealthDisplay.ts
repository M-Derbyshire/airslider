import { CentralStateKey } from '../../../levels/CentralStateKey';
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
     * Constructor
     * @param x the x position (in units) of the health display
     * @param y the y position (in units) of the health display
     * @param width the width (in units) of the health display
     * @param height the height (in units) of the health display
     */
    constructor(x:number, y:number, width:number, height:number)
    {
        super();
        
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        this._cornerRadiusModifier = 5;
    }
    
    load():void
    {
        super.load();
        
        const imagesDirPath = "/assets/HUDs/components/HealthDisplay/images";
        this._borderImage = this.kernel.loadImage(`${imagesDirPath}/lightning-border.png`);
        this._spannerImage = this.kernel.loadImage(`${imagesDirPath}/spanner.png`);
    }
    
    prepare():void {
        super.prepare();
        
        // Setup the text positions/dimensions
        this.text = {
            content: "",
            x: this.width * 0.4,
            y: this.height * 0.6,
            size: 65,
            font: "Jost",
            color: "#00FFFA",
            style: "",
            alignment: "left",
            lineGap: 0
        }
    }
    
    draw():void
    {
        const playerModelIndex = this.kernel.centralState.get(CentralStateKey.PlayerModelIndex);
        const health = (this.kernel.loadedModels[playerModelIndex] as unknown as Tarian).health;
        
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
        const unitWidth = this.width * 0.33;
        
        const { x, y, width, height } = this.kernel.graphicEngine.getStaticDrawPositionsAndDimensions({
            x: this.x, 
            y: this.y, 
            width: unitWidth, 
            height: this.height
        });
        
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, width, height, radiusModifierPixels);
        this.ctx.fill();
    }
    
    /**
     * Draws the background behind the health text
     * @param radiusModifierPixels The pixel value for the radius of the background's corners
     */
    private _drawTextBackground(radiusModifierPixels:number)
    {
        const unitWidth = this.width * 0.66;
        const unitHeight = this.height * 0.5;
        
        const xPos = this.x + (this.width * 0.33);
        const yPos = this.y + (this.height * 0.25);
        
        const { x, y, width, height } = this.kernel.graphicEngine.getStaticDrawPositionsAndDimensions({
            x: xPos, 
            y: yPos, 
            width: unitWidth, 
            height: unitHeight
        });
        
        // We only want a radius on the right side, as the left is connected to the spanner background
        const radiusModifiers = [
            0,
            radiusModifierPixels,
            radiusModifierPixels,
            0
        ];
        
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, width, height, radiusModifiers);
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
        const unitWidth = (this.width * 0.33) - (xPaddingUnits * 2);
        const unitHeight = this.height - (yPaddingUnits * 2)
        
        const { x, y, width, height } = this.kernel.graphicEngine.getStaticDrawPositionsAndDimensions({
            x: xPos, 
            y: yPos, 
            width: unitWidth, 
            height: unitHeight
        });
        
        this.ctx.drawImage(this._spannerImage, x, y, width, height);
    }
    
    /**
     * Draws the border image over the component
     */
    private _drawBorder()
    {
        // Used to push the border in/out a bit
        const paddingUnitsX = 5;
        const paddingUnitsY = 10;
        
        const xPos = this.x - paddingUnitsX;
        const yPos = this.y - paddingUnitsY;
        const unitWidth = this.width + (paddingUnitsX * 2);
        const unitHeight = this.height + (paddingUnitsY * 2);
        
        const { x, y, width, height } = this.kernel.graphicEngine.getStaticDrawPositionsAndDimensions({
            x: xPos, 
            y: yPos, 
            width: unitWidth, 
            height: unitHeight
        });
        
        this.ctx.drawImage(this._borderImage, x, y, width, height);
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