import ASHUDComponent from '../../ASHUDComponent/ASHUDComponent';

/**
 * A HUD component that displays text only
 */
export default class TextOnly extends ASHUDComponent 
{
    private _textContent: string;
    private _fontName: string;
    private _fontSize: number;
    private _color: string;
    private _style: string;
    private _alignment: CanvasTextAlign;
    private _lineGap: number;
    
    /**
     * Constructor
     * @param text the text to display
     * @param x the x position (in units) to draw the text at
     * @param y the y position (in units) to draw the text at
     * @param fontSize determines the font size for the text
     * @param fontName the name of the font to use
     * @param color the color of the text
     * @param style see the HTML5 Canvas's "font-style", "font-variant" and "font-weight" properties
     * @param alignment the alignment of the text
     * @param lineGap determines the size of the gap between each line of text
     */
	constructor(
        text:string,
        x:number,
        y:number,
        fontSize:number,
        fontName:string,
        color:string,
        style?:string,
        alignment?:CanvasTextAlign,
        lineGap?:number
    )
	{
		super();
        
        this._textContent = text;
        this.x = x;
        this.y = y;
        this._fontSize = fontSize;
        this._fontName = fontName;
        this._color = color;
        this._style = style;
        this._alignment = alignment
        this._lineGap = lineGap;
        
        this.width = this.kernel.unitsWithinCamera;
        this.height = fontSize + 10;
	}
    
    /**
     * Prepares the component before the level starts
     */
    prepare():void 
    {
        super.prepare();
        
        this.text = {
            content: this._textContent,
            x: 0,
            y: 0,
            font: this._fontName,
            size: this._fontSize,
            color: this._color,
            style: this._style ?? this.text.style,
            alignment: this._alignment ?? "left",
            lineGap: this._lineGap ?? 0
        };
    }
}