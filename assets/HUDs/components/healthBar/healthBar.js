class HealthBar extends HUDComponent
{
    constructor(x, y, width, height)
    {
        super(HUDComponent);
        
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        this.backColor = "#000044";
        this.barColor = "#ff0000";
    }
    
    draw()
    {
        let health = kernel.loadedModels[kernel.level.HUD.modelIndexes[0]].health;
        
        this.ctx.lineCap = "round";
        
        //back for bar
        this.ctx.strokeStyle = this.backColor;
        this.ctx.lineWidth = this.height;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x + (this.height / 2), this.y);
        this.ctx.lineTo((this.x - (this.height / 2)) + this.width, this.y);
        this.ctx.stroke();
        
        //bar for health
        if(health > 0)
        {
            this.ctx.strokeStyle = this.barColor;
            
            let healthX = this.x + (this.height / 2);
            let healthY = this.y;
            let healthWidth = ((this.width - this.height) / 100) * health;
            this.ctx.lineWidth = (this.height / 5) * 2;
            
            this.ctx.beginPath();
            this.ctx.moveTo(healthX, healthY);
            this.ctx.lineTo(healthX + healthWidth, healthY);
            this.ctx.stroke();
        }
    }
}