import ISoundEngine from '../../../../Kernel/engines/SoundEngine/ISoundEngine';
import Kernel from '../../../../Kernel/Kernel';
import UnitHelper from '../../../../Kernel/utils/UnitHelper';
import ASHUDComponent from '../../ASHUDComponent/ASHUDComponent';

/**
 * A HUDComponent that is a dialog box
 */
export default class Dialog extends ASHUDComponent 
{	
    private _titleText:string; // The text at the top of the dialog
    private _actionButton:ASHUDComponent // The button to disply within the dialog
    
    private _titleFontSize:number // The font size of the title
    private _textColor:string; // The color of any text
    private _fontName:string; // The font to use for the dialog
    private _textStyle:string; // The style to use for the text
    
    private _backgroundColor:string; // The color of the background
    private _cornerRadiusModifier:number; // Modifiers the rounded corners
    private _padding:number; // Adds padding inside the edges of the dialog
    private _borderColor:string; // The color of the dialog's border
    private _borderX:number; // The size of the border on the x axis
    private _borderY:number; // The size of the border on the y axis
    
	constructor(titleText:string, actionButton:ASHUDComponent, width:number, height:number, fontSize:number)
	{
		super();
        
        this._titleText = titleText;
        this._actionButton = actionButton;
        
        this.width = width;
        this.height = height;
        
        this._titleFontSize = fontSize;
        this._textColor = "#FDFF00";
        this._fontName = "Arial";
        this._textStyle = "bold";
        
        this._padding = 12;
        this._borderColor = "#FDFF00";
        this._backgroundColor = "#267F00";
        this._cornerRadiusModifier = 15;
        this._borderX = 3;
        this._borderY = 5;
	}
    
    /**
     * Prepares the component before the level starts
     * @param soundEngine the sound engine for the level
     */
    prepare(soundEngine:ISoundEngine):void
    {
        super.prepare(soundEngine);
        
        const settings = Kernel.getInstance().settings;
        
        // We determine the x/y using the width/height (to ensure it's always centered)
        this.x = (settings.unitsWithinCameraX / 2) - (this.width / 2);
        this.y = (settings.unitsWithinCameraY / 2) - (this.height / 2);
        
        this.text = {
            x: this.width / 2,
            y: this._titleFontSize + this._padding,
            alignment: "center",
            size: this._titleFontSize,
            content: this._titleText,
            color: this._textColor,
            font: this._fontName,
            style: this._textStyle,
            lineGap: 0
        };
        
        // Position the action button, to be at the botom of the dialog
        const xCenter = this.x + (this.width / 2);
        const bottom = this.y + this.height;
        const buttonBorderModifier = 5; // Some extra padding, as the button's border is outside its width/height boundaries
        
        this._actionButton.x = xCenter - (this._actionButton.width / 2);
        this._actionButton.y = bottom - this._actionButton.height - this._padding - buttonBorderModifier;
        
        // Hide the dialog by default
        this.active = false;
        this._actionButton.active = false;
    }
    
    /**
     * Draws the component
     */
    draw():void 
    {
        super.draw();
        
        const ctx = Kernel.getInstance().canvasContext;
        const originalFillColor = ctx.fillStyle;
        
        this._drawBorder(ctx);
        this._drawBackground(ctx);
        
        ctx.fillStyle = originalFillColor;
    }
    
    /**
     * Changes whether this dialog should be displayed
     */
    setDisplay(display:boolean)
    {
        this.active = display;
        this._actionButton.active = display;
    }
    
    /**
     * Draws the dialog's border
     * @param ctx The canvas's context
     */
    _drawBorder(ctx:CanvasRenderingContext2D)
    {
        const kernel = Kernel.getInstance();
        
        ctx.fillStyle = this._borderColor;
        
        const { x, y, width, height } = kernel.graphicEngine.getStaticDrawPositionsAndDimensions({ 
            x: this.x - this._borderX,
            y: this.y - this._borderY,
            width: this.width + (this._borderX * 2),
            height: this.height + (this._borderY * 2)
        });
        
        const cornerRadius = UnitHelper.xUnit(this._cornerRadiusModifier);
        
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, cornerRadius);
        ctx.fill();
    }
    
    /**
     * Draws the main dialog background
     * @param ctx The canvas's context
     */
    _drawBackground(ctx:CanvasRenderingContext2D)
    {
        const kernel = Kernel.getInstance();
        
        ctx.fillStyle = this._backgroundColor;
        
        const { x, y, width, height } = kernel.graphicEngine.getStaticDrawPositionsAndDimensions({ 
            x: this.x, 
            y: this.y, 
            width: this.width, 
            height: this.height
        });
        
        const cornerRadius = UnitHelper.xUnit(this._cornerRadiusModifier);
        
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, cornerRadius);
        ctx.fill();
    }
}