class HUDComponent
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        this.ctx = this.kernel.graphicEn.gameCtx;
    }
    
    load()
    {
        
    }
    
    //meant to be overriden
    draw(){}
}