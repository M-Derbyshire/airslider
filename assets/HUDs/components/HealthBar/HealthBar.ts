import ICamera from '../../../../engines/GraphicEn/ICamera';
import Tarian from '../../../models/Tarian/Tarian';
import ASHUDComponent from '../ASHUDComponent/ASHUDComponent';

/**
 * Displays the player's health
 */
export default class HealthBar extends ASHUDComponent
{
    private _x:number;
    private _y:number;
    private _width:number;
    private _height:number;
    
    private _targetIndex:number;
    
    private _backColor:string;
    private _barColor:string;
    
    /**
     * Constructor
     * @param x the x position (in units) of the health bar
     * @param y the y position (in units) of the health bar
     * @param width the width (in units) of the health bar
     * @param height the height (in units) of the health bar
     * @param targetModelIndex the index of the player model
     */
    constructor(x:number, y:number, width:number, height:number, targetModelIndex:number)
    {
        super();
        
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        
        this._targetIndex = targetModelIndex;
        
        this._backColor = "#000044";
        this._barColor = "#ff0000";
    }
    
    load(canvasCtx:CanvasRenderingContext2D, camera:ICamera):void
    {
        super.load(canvasCtx, camera);
    }
    
    draw():void
    {
		this.ctx.lineCap = "round";
		
        const health = (this.kernel.loadedModels[this._targetIndex] as unknown as Tarian).health;
        const cameraX = this.camera.canvasPositionX;
        const cameraY = this.camera.canvasPositionY;
		
		this._drawBarBorder(cameraX, cameraY);
        this._drawHealthLevel(cameraX, cameraY, health);
    }
	
	private _drawBarBorder(cameraX:number, cameraY:number):void
	{
        const backX = this.helpers.unit.xUnit(this._x);
        const backY = this.helpers.unit.yUnit(this._y);
        const backWidth = this.helpers.unit.xUnit(this._width);
        const backHeight = this.helpers.unit.yUnit(this._height);
        
        this.ctx.strokeStyle = this._backColor;
        this.ctx.lineWidth = backHeight;
        this.ctx.beginPath();
        this.ctx.moveTo(cameraX + backX + (backHeight / 2), cameraY + backY);
        this.ctx.lineTo((cameraX + backX - (backHeight / 2)) + backWidth, cameraY + backY);
        this.ctx.stroke();
	}
	
	private _drawHealthLevel(cameraX:number, cameraY:number, health:number):void
	{
		if(health > 0)
        {
            this.ctx.strokeStyle = this._barColor;
            
            const healthX = this.helpers.unit.xUnit(this._x + (this._height / 2));
            const healthY = this.helpers.unit.yUnit(this._y);
            const healthWidth = this.helpers.unit.xUnit(((this._width - this._height) / 100) * health);
            this.ctx.lineWidth = this.helpers.unit.yUnit((this._height / 5) * 2);
            
            this.ctx.beginPath();
            this.ctx.moveTo(cameraX + healthX, cameraY + healthY);
            this.ctx.lineTo(cameraX + healthX + healthWidth, cameraY + healthY);
            this.ctx.stroke();
        }
	}
}