class LevelRoad
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
    }
    
    draw(color)
    {
        const cameraPositions = this.kernel.graphicEn.camera.positions.canvas;
        
        this.kernel.graphicEn.gameCtx.lineWidth = 1;
        this.kernel.graphicEn.gameCtx.fillStyle = color;
        this.kernel.graphicEn.gameCtx.beginPath();
        this.kernel.graphicEn.gameCtx.moveTo(cameraPositions.x, cameraPositions.y + cameraPositions.height);
        this.kernel.graphicEn.gameCtx.lineTo(this.helpers.zCalc.vPointX, this.helpers.zCalc.vPointY);
        this.kernel.graphicEn.gameCtx.lineTo(cameraPositions.x + cameraPositions.width, cameraPositions.y + cameraPositions.height);
        this.kernel.graphicEn.gameCtx.fill();
    }
}