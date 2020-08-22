class LevelRoad
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        this._camera; //Set in load
    }
    
    load(camera)
    {
        this._camera = camera;
    }
    
    draw(color)
    {
        this.kernel.graphicEn.gameCtx.lineWidth = 1;
        this.kernel.graphicEn.gameCtx.fillStyle = color;
        this.kernel.graphicEn.gameCtx.beginPath();
        this.kernel.graphicEn.gameCtx.moveTo(this._camera.canvasPositionX, this._camera.canvasPositionY + this._camera.canvasPositionHeight);
        this.kernel.graphicEn.gameCtx.lineTo(this.helpers.zCalc.vPointX, this.helpers.zCalc.vPointY);
        this.kernel.graphicEn.gameCtx.lineTo(this._camera.canvasPositionX + this._camera.canvasPositionWidth, this._camera.canvasPositionY + this._camera.canvasPositionHeight);
        this.kernel.graphicEn.gameCtx.fill();
    }
}