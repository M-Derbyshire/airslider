class HUDComponent
{
    constructor()
    {
        this.ctx = kernel.graphicEn.infoCtx;
    }
    
    //meant to be overriden
    draw(){}
}