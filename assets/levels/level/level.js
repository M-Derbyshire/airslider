class Level
{
    constructor()
    {
        this.background = "white"; //use a color if nothing set in subclass (hence true on the next line)
        this.useColorBackground = true;
        
        this.roadColor = "#999999";
    }
    
    //set things that can only be done after the engines are constructed
    load()
    {
        zCalc.setVanishPoint(kernel.graphicEn.gameCan.width / 2, kernel.graphicEn.gameCan.height / 2, 1000);
    }
    
    //meant to be overridden
    getModels(){}
    
    act()
    {
        
    }
    
    drawBack()
    {
        
        
        this.drawRoad()
        
        if(this.extraDrawBack)
        {
            this.extraDrawBack();
        }
    }
    
    drawFront()
    {
        
        
        if(this.extraDrawFront)
        {
            this.extraDrawFront();
        }
    }
    
    
    drawRoad()
    {
        kernel.graphicEn.gameCtx.lineWidth = 1;
        kernel.graphicEn.gameCtx.fillStyle = this.roadColor;
        kernel.graphicEn.gameCtx.beginPath();
        kernel.graphicEn.gameCtx.moveTo(0, kernel.graphicEn.gameCan.height);
        kernel.graphicEn.gameCtx.lineTo(zCalc.vPointX, zCalc.vPointY);
        kernel.graphicEn.gameCtx.lineTo(kernel.graphicEn.gameCan.width, kernel.graphicEn.gameCan.height);
        kernel.graphicEn.gameCtx.fill();
    }
}