import Kernel from '/kernel/kernel';
import HUDComponent from '/assets/HUDs/components/HUDComponent/HUDComponent';

export default class HealthBar extends HUDComponent
{
    constructor(x, y, width, height, targetModelIndex)
    {
        super(HUDComponent);
        
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
        const health = this.kernel.loadedModels[this.targetIndex].health;
        
        const cameraX = this._camera.canvasPositionX;
        const cameraY = this._camera.canvasPositionY;
        
        this._ctx.lineCap = "round";
        
        
        //back for bar
        const backX = this.helpers.unit.xUnit(this.x);
        const backY = this.helpers.unit.yUnit(this.y);
        const backWidth = this.helpers.unit.xUnit(this.width);
        const backHeight = this.helpers.unit.yUnit(this.height);
        
        this._ctx.strokeStyle = this.backColor;
        this._ctx.lineWidth = backHeight;
        this._ctx.beginPath();
        this._ctx.moveTo(cameraX + backX + (backHeight / 2), cameraY + backY);
        this._ctx.lineTo((cameraX + backX - (backHeight / 2)) + backWidth, cameraY + backY);
        this._ctx.stroke();
        
        //bar for health
        if(health > 0)
        {
            this._ctx.strokeStyle = this.barColor;
            
            const healthX = this.helpers.unit.xUnit(this.x + (this.height / 2));
            const healthY = this.helpers.unit.yUnit(this.y);
            const healthWidth = this.helpers.unit.xUnit(((this.width - this.height) / 100) * health);
            this._ctx.lineWidth = this.helpers.unit.yUnit((this.height / 5) * 2);
            
            this._ctx.beginPath();
            this._ctx.moveTo(cameraX + healthX, cameraY + healthY);
            this._ctx.lineTo(cameraX + healthX + healthWidth, cameraY + healthY);
            this._ctx.stroke();
        }
    }
}