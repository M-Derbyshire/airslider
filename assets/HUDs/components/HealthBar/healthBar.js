import Kernel from '/Kernel/kernel';
import ASHUDComponent from '/assets/HUDs/components/ASHUDComponent/ASHUDComponent';

export default class HealthBar extends ASHUDComponent
{
    constructor(x, y, width, height, targetModelIndex)
    {
        super(ASHUDComponent);
        
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        this.targetIndex = targetModelIndex;
        
        this.backColor = "#000044";
        this.barColor = "#ff0000";
    }
    
    load(canvasCtx, camera)
    {
        super.load(canvasCtx, camera);
    }
    
    draw()
    {
		this.ctx.lineCap = "round";
		
        const health = this.kernel.loadedModels[this.targetIndex].health;
        const cameraX = this.camera.canvasPositionX;
        const cameraY = this.camera.canvasPositionY;
		
		this._drawBarBorder(cameraX, cameraY);
        this._drawHealthLevel(cameraX, cameraY, health);
    }
	
	_drawBarBorder(cameraX, cameraY)
	{
        const backX = this.helpers.unit.xUnit(this.x);
        const backY = this.helpers.unit.yUnit(this.y);
        const backWidth = this.helpers.unit.xUnit(this.width);
        const backHeight = this.helpers.unit.yUnit(this.height);
        
        this.ctx.strokeStyle = this.backColor;
        this.ctx.lineWidth = backHeight;
        this.ctx.beginPath();
        this.ctx.moveTo(cameraX + backX + (backHeight / 2), cameraY + backY);
        this.ctx.lineTo((cameraX + backX - (backHeight / 2)) + backWidth, cameraY + backY);
        this.ctx.stroke();
	}
	
	_drawHealthLevel(cameraX, cameraY, health)
	{
		if(health > 0)
        {
            this.ctx.strokeStyle = this.barColor;
            
            const healthX = this.helpers.unit.xUnit(this.x + (this.height / 2));
            const healthY = this.helpers.unit.yUnit(this.y);
            const healthWidth = this.helpers.unit.xUnit(((this.width - this.height) / 100) * health);
            this.ctx.lineWidth = this.helpers.unit.yUnit((this.height / 5) * 2);
            
            this.ctx.beginPath();
            this.ctx.moveTo(cameraX + healthX, cameraY + healthY);
            this.ctx.lineTo(cameraX + healthX + healthWidth, cameraY + healthY);
            this.ctx.stroke();
        }
	}
}