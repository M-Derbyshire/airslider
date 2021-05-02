import Kernel from '../kernel/Kernel';

class ControlsInitialiser
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        
        //setup any variables required by your listeners here
        this.currentMove;
    }
    
    
    //place methods in this class to setup the controls
    //Pass in the model index number (this.kernel.loadedModels array) if needed
    
    //This is for playing in browser
    keyboardControls(index)
    {
        if(!this.kernel.isOnMobile)
        {
            window.addEventListener("keydown", (e) => {
                // this.currentMove = e.key;
                if(this.currentMove !== e.key)
                {
                    switch(e.key)
                    {
                        case "ArrowLeft":
                            this.kernel.loadedModels[index].state = "left";
                            break;
                        case "ArrowRight":
                            this.kernel.loadedModels[index].state = "right";
                            break;
                    }
                    this.currentMove = e.key;
                }
            }, true);
            
            window.addEventListener("keyup", (e) => {
                if(this.currentMove == e.key)
                {
                    this.kernel.loadedModels[index].state = "forward";
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
                    this.kernel.loadedModels[index].state = "left";
                    this.currentMove = "ArrowLeft";
                } else {
                    this.kernel.loadedModels[index].state = "right";
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
                        this.kernel.loadedModels[index].state = "left";
                        break;
                    case "ArrowRight":
                        this.kernel.loadedModels[index].state = "right";
                        break;
                }
            }
            
            if(!newMove)
            {
                this.kernel.loadedModels[index].state = "forward";
                this.currentMove = "";
            }
        }, true);
    }
}