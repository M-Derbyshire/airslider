class ControlConstructor
{
    constructor()
    {
        //setup any variables required by your listeners here
        this.currentMove;
    }
    
    
    //place methods in this class to setup the controls
    //Pass in the model index number (kernel.loadedModels array) if needed
    
    //This is for playing in browser
    keyboardControls(index)
    {
        if(!kernel.isOnMobile)
        {
            window.addEventListener("keydown", (e) => {
                // this.currentMove = e.key;
                if(this.currentMove !== e.key)
                {
                    switch(e.key)
                    {
                        case "ArrowLeft":
                            kernel.loadedModels[index].state = "left";
                            break;
                        case "ArrowRight":
                            kernel.loadedModels[index].state = "right";
                            break;
                    }
                    this.currentMove = e.key;
                }
            }, true);
            
            window.addEventListener("keyup", (e) => {
                if(this.currentMove == e.key)
                {
                    kernel.loadedModels[index].state = "forward";
                    this.currentMove = "";
                }
            }, true);
        }
    }
    
    //these are for game on mobile (can also be used in browser with mouse)
    touchControls(index)
    {
        window.addEventListener("touchstart", (e) => {
            for(let i = 0; i < e.touches.length; i++)
            {
                if(e.touches[i].pageX < (window.innerWidth / 2))
                {
                    kernel.loadedModels[index].state = "left";
                    this.currentMove = "ArrowLeft";
                } else {
                    kernel.loadedModels[index].state = "right";
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
                        kernel.loadedModels[index].state = "left";
                        break;
                    case "ArrowRight":
                        kernel.loadedModels[index].state = "right";
                        break;
                }
            }
            
            if(!newMove)
            {
                kernel.loadedModels[index].state = "forward";
                this.currentMove = "";
            }
        }, true);
    }
}
var controlConstructor = new ControlConstructor();