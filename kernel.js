class Kernel {
    constructor()
    {
        this.fps = 24;
        this.loadedModels = []; //will hold all models loaded during loading
        let filePath = window.location.pathname;
        this.rootPath = filePath.substring(0, filePath.lastIndexOf('/'));
        this.lastTime = new Date();
    }
    
    load()
    {
        //push models here so they can be picked up by the engines
        this.loadedModels.push(new Tarian());
        
        this.gameEn = new GameEn();
        this.graphicEn = new GraphicEn();
        this.soundEn = new SoundEn();
        this.menuEn = new MenuEn();
        
        //do any extra setup that may need access to the engines
        for(let i = 0; i < this.loadedModels.length; i++)
        {
            this.loadedModels[i].load();
        }
    }
    
    run()
    {
        requestAnimationFrame(this.run.bind(this));
        
        //don't run unless it's time for next frame
        this.dt = new Date();
        if((this.dt.getTime() - this.lastTime.getTime()) < (1000 / this.fps))
        {
            return;
        }
        this.lastTime = new Date();
        
        this.gameEn.run();
        this.graphicEn.run();
        this.soundEn.run();
    }
}