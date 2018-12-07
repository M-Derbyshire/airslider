class GameEn{
    constructor()
    {
        //setup for control events
        this.currentMove;
        
        //these first 2 are for testing on computer
        if(window.innerWidth >= 900)
        {
            window.addEventListener("keydown", (e) => {
                // this.currentMove = e.key;
                if(this.currentMove !== e.key)
                {
                    switch(e.key)
                    {
                        case "ArrowLeft":
                            kernel.loadedModels[0].changeState("left");
                            break;
                        case "ArrowRight":
                            kernel.loadedModels[0].changeState("right");
                            break;
                    }
                    this.currentMove = e.key;
                }
            }, true);
            
            window.addEventListener("keyup", (e) => {
                if(this.currentMove == e.key)
                {
                    kernel.loadedModels[0].changeState("forward");
                    this.currentMove = "";
                }
            }, true);
        }
        
        
        //these are for game on mobile
        window.addEventListener("touchstart", (e) => {
            for(let i = 0; i < e.touches.length; i++)
            {
                if(e.touches[i].pageX < (window.innerWidth / 2))
                {
                    kernel.loadedModels[i].changeState("left");
                    this.currentMove = "ArrowLeft";
                } else {
                    kernel.loadedModels[i].changeState("right");
                    this.currentMove = "ArrowRight";
                }
            }
        }, true);
        
        window.addEventListener("touchend", (e) => {
            let newMove = null;
            for(let i = 0; i < e.touches.length; i++)
            {
                if(e.touches[i].pageX < (window.innerWidth / 2))
                {
                    newMove = "ArrowLeft";
                } else {
                    newMove = "ArrowRight";
                }
            }
            
            if(newMove && this.currentMove != newMove)
            {
                this.currentMove = newMove;
                
                switch(newMove)
                {
                    case "ArrowLeft":
                        kernel.loadedModels[0].changeState("left");
                        break;
                    case "ArrowRight":
                        kernel.loadedModels[0].changeState("right");
                        break;
                }
            }
            
            if(!newMove)
            {
                kernel.loadedModels[0].changeState("forward");
                this.currentMove = "";
            }
        }, true);
    }
    
    run()
    {
        for (let i = 0; i < kernel.loadedModels.length; i++)
        {
            if(kernel.loadedModels[i].active)
            {
                kernel.loadedModels[i].move();
            }
        }
        
        //needs to be seperate from the for loop above.
        //as both/all models involved in an event need to
        //know it
        for (let i = 0; i < kernel.loadedModels.length; i++)
        {
            if(kernel.loadedModels[i].active)
            {
                kernel.loadedModels[i].checkEvents();
            }
        }
    }
}