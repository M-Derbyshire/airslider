import IAssetHandler from '../../../Kernel/AssetHandler/IAssetHandler';
import IGraphicEngine from '../../../Kernel/engines/GraphicEngine/IGraphicEngine';
import Kernel from '../../../Kernel/Kernel';
import UnitHelper from '../../../Kernel/utils/UnitHelper';
import { CentralStateKey } from '../../levels/CentralStateKey';
import Tarian from '../../models/Tarian/Tarian';
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
    private _borderImage!:HTMLImageElement;
    
    /**
     * The spanner image
     */
    private _spannerImage!:HTMLImageElement;
    
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
    
    /**
     * Loads the component
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    load(assetHandler:IAssetHandler):void
    {
        super.load(assetHandler);
        
        const imagesDirPath = "/HUDComponents/HealthDisplay/images";
        this._borderImage = assetHandler.loadImage(`${imagesDirPath}/lightning-border.png`);
        this._spannerImage = assetHandler.loadImage(`${imagesDirPath}/spanner.png`);
    }
    
    /**
     * Prepares the component before the level starts
     */
    prepare():void
    {
        super.prepare();
        
        // Setup the text positions/dimensions
        this.text = {
            content: "",
            x: this.width * 0.65,
            y: this.height * 0.6,
            size: 60,
            font: "Verdana, sans-serif",
            color: "#00FFFA",
            style: "",
            alignment: "center",
            lineGap: 0
        }
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
        
        const playerModelIndex = kernel.centralState.get(CentralStateKey.PlayerModelIndex);
        const health = (kernel.loadedModels[playerModelIndex] as unknown as Tarian).health;
        
		const radiusModifierPixels = UnitHelper.xUnitsToPixels(this._cornerRadiusModifier);
        
        // Determine the background color, based on the health
        let color:string;
        
        if(health > 50)
            color = this._highHealthColor;
        else if(health > 15)
            color = this._midHealthColor;
        else
            color = this._lowHealthColor;
        
        canvasContext.globalAlpha = 0.5;
        canvasContext.fillStyle = color;
        this._drawSectionsBackgrounds(radiusModifierPixels);
        canvasContext.globalAlpha = 1;
        
        this._drawSpanner();
        this._drawBorder();
        
        this._setText(health);
    }

    /**
     * Draws the backgrounds behind the different sections of the display
     * @param radiusModifierPixels The pixel value for the radius of a background rectangle's corners
     */
    private _drawSectionsBackgrounds(radiusModifierPixels:number)
    {
        const kernel = Kernel.getInstance();
        const ctx = kernel.canvasContext;

        ctx.beginPath();

        this._drawSpannerBackgroundRect(radiusModifierPixels);
        this._drawTextBackgroundRect(radiusModifierPixels);

        ctx.fill();
    }
    
    /**
     * Draws the background rectangle behind the spanner image
     * @param radiusModifierPixels The pixel value for the radius of the background's corners
     */
    private _drawSpannerBackgroundRect(radiusModifierPixels:number)
    {
        const kernel = Kernel.getInstance();
        const ctx = kernel.canvasContext;
        
        const unitWidth = this.width * 0.33;
        
        const { x, y, width, height } = kernel.graphicEngine.getStaticDrawPositionsAndDimensions({
            x: this.x,
            y: this.y,
            width: unitWidth,
            height: this.height
        });
        
        ctx.roundRect(x, y, width, height, radiusModifierPixels);
    }
    
    /**
     * Draws the background rectangle behind the health text
     * @param radiusModifierPixels The pixel value for the radius of the background's corners
     */
    private _drawTextBackgroundRect(radiusModifierPixels:number)
    {
        const kernel = Kernel.getInstance();
        const ctx = kernel.canvasContext;
        
        const unitWidth = this.width * 0.66;
        const unitHeight = this.height * 0.5;
        
        const xPos = this.x + (this.width * 0.33);
        const yPos = this.y + (this.height * 0.25);
        
        const { x, y, width, height } = kernel.graphicEngine.getStaticDrawPositionsAndDimensions({
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
        
        ctx.roundRect(x, y, width, height, radiusModifiers);
    }
    
    /**
     * Draws the spanner image
     */
    private _drawSpanner()
    {
        const kernel = Kernel.getInstance();
        const ctx = kernel.canvasContext;
        
        const xPaddingUnits = 10; // Padding between the image and the border, on the x-axis
        const yPaddingUnits = 20; // Padding between the image and the border, on the y-axis
        
        const xPos = this.x + xPaddingUnits;
        const yPos = this.y + yPaddingUnits
        const unitWidth = (this.width * 0.33) - (xPaddingUnits * 2);
        const unitHeight = this.height - (yPaddingUnits * 2)
        
        const { x, y, width, height } = kernel.graphicEngine.getStaticDrawPositionsAndDimensions({
            x: xPos, 
            y: yPos, 
            width: unitWidth, 
            height: unitHeight
        });
        
        ctx.drawImage(this._spannerImage, x, y, width, height);
    }
    
    /**
     * Draws the border image over the component
     */
    private _drawBorder()
    {
        const kernel = Kernel.getInstance();
        const ctx = kernel.canvasContext;
        
        // Used to push the border in/out a bit
        const paddingUnitsX = 5;
        const paddingUnitsY = 10;
        
        const xPos = this.x - paddingUnitsX;
        const yPos = this.y - paddingUnitsY;
        const unitWidth = this.width + (paddingUnitsX * 2);
        const unitHeight = this.height + (paddingUnitsY * 2);
        
        const { x, y, width, height } = kernel.graphicEngine.getStaticDrawPositionsAndDimensions({
            x: xPos, 
            y: yPos, 
            width: unitWidth,
            height: unitHeight
        });
        
        ctx.drawImage(this._borderImage, x, y, width, height);
    }
    
    /**
     * Sets the health value text
     * @param health the current health value
     */
    private _setText(health:number)
    {
        this.text.content = `${Math.ceil(health)}%`;
    }
}