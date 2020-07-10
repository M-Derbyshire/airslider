class HUDComponent
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        this.ctx = this.kernel.graphicEn.gameCtx;
    }
    
    //meant to be overriden
    draw(){}
    load(){}
    
    loadSuper()
    {
        
    }
}