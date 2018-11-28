class GameEn{
    constructor()
    {
        //setup key press events
        this.currentMove;
        
        //these first 2 are for testing on computer
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
                    case "ArrowUp":
                        kernel.loadedModels[0].changeState("push");
                        break;
                    case "ArrowDown":
                        kernel.loadedModels[0].changeState("pull");
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
        
        //these are for game on mobile
        window.addEventListener("mousedown", (e) => {
            if(e.clientX < (window.innerWidth / 2))
            {
                kernel.loadedModels[0].changeState("left");
                this.currentMove = "ArrowLeft";
            } else {
                kernel.loadedModels[0].changeState("right");
                this.currentMove = "ArrowRight";
            }
        }, true);
        
        window.addEventListener("mouseup", (e) => {
            let newMove;
            if(e.clientX < (window.innerWidth / 2))
            {
                newMove = "ArrowLeft";
            } else {
                newMove = "ArrowRight";
            }
            
            if(this.currentMove == newMove)
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