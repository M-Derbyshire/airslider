class GraphicEn{
    constructor()
    {
        //used when making sure models are displayed in the right order based on their z-index
        this.zSortedIndexes = [];
        for(let i = 0; i < kernel.loadedModels.length; i++)
        {
            this.zSortedIndexes.push(i);
        }
        
        this.backCan = document.getElementById("backCan");
        this.backCtx = this.backCan.getContext("2d");
        this.gameCan = document.getElementById("gameCan");
        this.gameCtx = this.gameCan.getContext("2d");
        this.infoCan = document.getElementById("infoCan");
        this.infoCtx = this.infoCan.getContext("2d");
        this.menuCan = document.getElementById("menuCan");
        this.menuCtx = this.menuCan.getContext("2d");
        
        this.setBackground(kernel.level.background, kernel.level.useColorBackground);
    }
    
    run()
    {
        //this will be used to make sure the models are displayed in order
        this.zSortedIndexes.sort((a, b) => {
            return kernel.loadedModels[b].z - kernel.loadedModels[a].z;
        });
        
        //clear everything on the gameCan
        this.gameCtx.clearRect(0, 0, this.gameCan.width, this.gameCan.height);
        
        kernel.level.drawBack();
        
        for(let i = 0; i < kernel.loadedModels.length; i++)
        {
            if(kernel.loadedModels[this.zSortedIndexes[i]].active)
            {
                kernel.loadedModels[this.zSortedIndexes[i]].draw();
            }
        }
        
        kernel.level.drawFront();
        
        if(kernel.level.HUD.update)
        {
            this.infoCtx.clearRect(0, 0, this.infoCan.width, this.infoCan.height);
            kernel.level.HUD.draw();
        }
    }
    
    setBackground(input, useColor = false)
    {
        if(useColor)
        {
            this.backCtx.fillStyle = input;
            this.backCtx.fillRect(0, 0, this.backCan.width, this.backCan.height);
        } else {
            
        }
    }
}