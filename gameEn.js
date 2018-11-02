class GameEn{
    constructor()
    {
        //setup key press events
        this.currentKey;
        window.addEventListener("keydown", (e) => {
            this.currentKey = e.key;
        }, true);
        
        window.addEventListener("keyup", (e) => {
            if(this.currentKey == e.key)
            {
                this.currentKey = "";
            }
        }, true);
    }
    
    run()
    {
        //controls
        if(this.currentKey == "ArrowLeft")
        {
            kernel.loadedModels[0].move(3);
        }
        if(this.currentKey == "ArrowRight")
        {
            kernel.loadedModels[0].move(1);
        }
    }
}