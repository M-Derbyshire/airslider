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
        
        this.setCanvasSize([this.backCan, this.gameCan, this.infoCan, this.menuCan]);
        
        this.setBackground("white", true);
        
        //road values
        this.roadColor = "#999999";
        zCalc.setVanishPoint(this.gameCan.width / 2, this.gameCan.height / 2, 1000);
    }
    
    run()
    {
        //clear everything on the gameCan
        this.gameCtx.clearRect(0, 0, this.gameCan.width, this.gameCan.height);
        
        this.drawRoad();
        
        for(let i = 0; i < kernel.loadedModels.length; i++)
        {
            if(kernel.loadedModels[i].active)
            {
                kernel.loadedModels[i].draw();
            }
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
        let width;
        let height;
        let dpi = window.devicePixelRatio || 1;
        
        //should be essentially 17:9
        //if 17:9 is stretches out of window, correct it
        // 17 / 9 = 1.88888 (and a bit more)
        let widthRatio = 1.88888;
        if((window.innerWidth / widthRatio) > window.innerHeight)
        {
            height = window.innerHeight;
            width = height * widthRatio;
        } else {
            height = window.innerWidth / widthRatio;
            width = window.innerWidth;
        }
        
        let x = (window.innerWidth - width) / 2;
        let y = (window.innerHeight - height) / 2;
        
        for(let i = 0; i < canvas.length; i++)
        {
            canvas[i].style.left = x + "px";
            canvas[i].style.top = y + "px";
            canvas[i].width = width * dpi;
            canvas[i].height = height * dpi;
            canvas[i].style.width = width + "px";
            canvas[i].style.height = height + "px";
        }
    }
    
    drawRoad()
    {
        this.gameCtx.lineWidth = 1;
        this.gameCtx.fillStyle = this.roadColor;
        this.gameCtx.beginPath();
        this.gameCtx.moveTo(0, this.gameCan.height);
        this.gameCtx.lineTo(zCalc.vPointX, zCalc.vPointY);
        this.gameCtx.lineTo(this.gameCan.width, this.gameCan.height);
        this.gameCtx.fill();
    }
}