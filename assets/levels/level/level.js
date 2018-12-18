class Level
{
    constructor()
    {
        this.background = "white"; //use a color if nothing set in subclass (hence true on the next line)
        this.useColorBackground = true;
        
        this.roadColor = "#999999";
        
        this.framesPassed = 0;
        
        this.shockerCount;
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
        
        if(this.extraDrawBack)
        {
            this.extraDrawBack();
        }
        
        this.drawRoad()
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
    
    
    //level sections ---------------------------------------
    
    sendShockers(fromIndex, toIndex)
    {
        for(let i = fromIndex; i <= toIndex; i++)
        {
            if((!kernel.loadedModels[i].active && i == fromIndex) || (!kernel.loadedModels[i].active && kernel.loadedModels[i - 1].active && kernel.loadedModels[i].z > (kernel.loadedModels[i - 1].z + (zCalc.vPointDepth / this.shockerCount))))
            {
                let leftEdge = 0;
                let rightEdge = kernel.graphicEn.gameCan.width - kernel.loadedModels[i].anims[kernel.loadedModels[i].state].width;
                
                kernel.loadedModels[i].z = zCalc.vPointDepth;
                kernel.loadedModels[i].y = (Math.random() * (rightEdge - leftEdge) + leftEdge);
                
                kernel.loadedModels[i].active = true;
            }
        }
    }
    
}