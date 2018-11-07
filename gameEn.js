class GameEn{
    constructor()
    {
        //setup key press events
        this.currentMove;
        
        //these first 2 are for testing on computer
        window.addEventListener("keydown", (e) => {
            this.currentMove = e.key;
        }, true);
        
        window.addEventListener("keyup", (e) => {
            if(this.currentMove == e.key)
            {
                this.currentMove = "";
            }
        }, true);
        
        //these are for game on mobile
        window.addEventListener("mousedown", (e) => {
            if(e.clientX < (window.innerWidth / 2))
            {
                this.currentMove = "ArrowLeft";
            } else {
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
                this.currentMove = "";
            }
        }, true);
    }
    
    run()
    {
        //controls
        if(this.currentMove == "ArrowLeft")
        {
            kernel.loadedModels[0].move(3);
        }
        if(this.currentMove == "ArrowRight")
        {
            kernel.loadedModels[0].move(1);
        }
    }
}