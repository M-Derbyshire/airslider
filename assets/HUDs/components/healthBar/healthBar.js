class HealthBar extends HUDComponent
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
    
    load()
    {
        super.load();
    }
    
    draw()
    {
        const health = this.kernel.loadedModels[this.targetIndex].health;
        
        const cameraX = this.kernel.graphicEn.camera.positions.canvas.x;
        const cameraY = this.kernel.graphicEn.camera.positions.canvas.y;
        
        this.ctx.lineCap = "round";
        
        
        //back for bar
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
        
        //bar for health
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