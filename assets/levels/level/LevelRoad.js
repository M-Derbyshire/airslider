class LevelRoad
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
    }
    
    draw(color)
    {
        this.kernel.graphicEn.gameCtx.lineWidth = 1;
        this.kernel.graphicEn.gameCtx.fillStyle = color;
        this.kernel.graphicEn.gameCtx.beginPath();
        this.kernel.graphicEn.gameCtx.moveTo(0, this.kernel.graphicEn.gameCan.height);
        this.kernel.graphicEn.gameCtx.lineTo(this.helpers.zCalc.vPointX, this.helpers.zCalc.vPointY);
        this.kernel.graphicEn.gameCtx.lineTo(this.kernel.graphicEn.gameCan.width, this.kernel.graphicEn.gameCan.height);
        this.kernel.graphicEn.gameCtx.fill();
    }
}