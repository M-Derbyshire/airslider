class HealthBar extends HUDComponent
{
    constructor(x, y, width, height)
    {
        super(HUDComponent);
        
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        this.backColor = "#999999";
        this.barColor = "#ff0000";
    }
    
    draw()
    {
        this.ctx.lineWidth = this.height;
        this.ctx.strokeStyle = this.backColor;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.x + (this.height / 2), this.y);
        this.ctx.lineTo((this.x - (this.height / 2)) + this.width, this.y);
        this.ctx.stroke();
        console.log("x - " + this.x);
    }
}