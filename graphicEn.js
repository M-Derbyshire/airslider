class GraphicEn{
    constructor()
    {
        this.backCan = document.getElementById("backCan");
        this.backCtx = this.backCan.getContext("2d");
        this.gameCan = document.getElementById("gameCan");
        this.gameCtx = this.gameCan.getContext("2d");
        this.infoCan = document.getElementById("infoCan");
        this.infoCtx = this.infoCan.getContext("2d");
        this.menuCan = document.getElementById("menuCan");
        this.menuCtx = this.menuCan.getContext("2d");
        
        this.visibleModels = []; //references to models in kernel.loadedModels
        
        this.setCanvasSize([this.backCan, this.gameCan, this.infoCan, this.menuCan]);
        this.setBackground("white", true);
    }
    
    run()
    {
        //just setting up the reference to Tarian
        if(this.visibleModels[0] != kernel.loadedModels[0])
        {
            this.visibleModels[0] = kernel.loadedModels[0];
        }
        
        //clear everything on the gameCan
        this.gameCtx.clearRect(0, 0, this.gameCan.width, this.gameCan.height);
        
        for(let i = 0; i < this.visibleModels.length; i++)
        {
            this.visibleModels[i].draw();
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
    
    setCanvasSize(canvas)
    {
        let x = 10;
        let y = 10;
        let width = window.innerWidth - (x * 2);
        let height = (window.innerHeight / 1.1) - (y * 2);
        
        for(let i = 0; i < canvas.length; i++)
        {
            canvas[i].style.left = x + "px";
            canvas[i].style.top = y + "px";
            canvas[i].width = width;
            canvas[i].height = height;
        }
    }
}