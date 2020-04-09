class HUDComponent
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        this.ctx = this.kernel.graphicEn.infoCtx;
    }
    
    //meant to be overriden
    draw(){}
    load(){}
    
    loadSuper()
    {
        
    }
}