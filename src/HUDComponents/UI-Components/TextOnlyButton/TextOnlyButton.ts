import IGraphicEngine from '../../../../Kernel/engines/GraphicEngine/IGraphicEngine';
import ISoundEngine from '../../../../Kernel/engines/SoundEngine/ISoundEngine';
import ASHUDComponent from '../../ASHUDComponent/ASHUDComponent';

/**
 * A HUDComponent that is a button, but only the text is visible
 */
export default class TextOnlyButton extends ASHUDComponent 
{
    private _onClick:()=>void;
    private _textContent: string;
    private _fontSize: number;
    private _fontName: string;
    private _textColor: string;
    private _textStyle: string;
    private _drawBoundaryBox: boolean;
    
    /**
     * Constructor
     * @param onClick a callbck to trigger when the player clicks this
     * @param x the x position (in units) of the button
     * @param y the y position (in units) of the button
     * @param width the width (in units) of the button
     * @param height the height (in units) of the button
     * @param text the text to display
     * @param fontSize the font size for the text
     * @param fontName the name of the font to use
     * @param textColor the color of the text
     * @param textStyle see the HTML5 Canvas's "font-style", "font-variant" and "font-weight" properties
     * @param drawBoundaryBox should a box be drawn around the button (can be used to test its position/dimensions)
     */
	constructor(
        onClick:()=>void,
        x:number,
        y:number,
        width:number,
        height:number,
        text:string,
        fontSize:number,
        fontName:string,
        textColor:string,
        textStyle?:string,
        drawBoundaryBox:boolean = false
    )
	{
		super();
        
        this._onClick = onClick;
        
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        this._textContent = text;
        this._fontSize = fontSize;
        this._fontName = fontName;
        this._textColor = textColor;
        this._textStyle = textStyle;
        
        this._drawBoundaryBox = drawBoundaryBox;
	}
    
    /**
     * Prepares the component before the level starts
     * @param soundEngine the sound engine for the level
     */
    prepare(soundEngine:ISoundEngine):void
    {
        super.prepare(soundEngine);
        
        this.text = {
            content: this._textContent,
            x: this.width / 2,
            y: (this.height / 2) + (this._fontSize / 4),
            font: this._fontName,
            size: this._fontSize,
            color: this._textColor,
            style: this._textStyle ?? this.text.style,
            alignment: "center",
            lineGap: 0
        };
    }
    
    /**
     * Draws the component
     * @param graphicEngine the graphic engine for the level
     * @param canvasContext the 2D context from the HTML canvas element
     */
    draw(graphicEngine:IGraphicEngine, canvasContext:CanvasRenderingContext2D):void
    {
        super.draw(graphicEngine, canvasContext);
        
        if(this._drawBoundaryBox)
        {
            const originalStrokeColor = canvasContext.strokeStyle;
            canvasContext.strokeStyle = "red";
            
            const { x, y, width, height } = graphicEngine.getStaticDrawPositionsAndDimensions({ 
                x: this.x, 
                y: this.y, 
                width: this.width, 
                height: this.height
            });
            canvasContext.strokeRect(x, y, width, height);
            
            canvasContext.strokeStyle = originalStrokeColor;
        }
    }
    
    /**
     * Triggers the given on click callback
     */
    onClick()
    {
        this._onClick();
    }
}