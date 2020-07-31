class HUD
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        this.components = []; //HUD components included
        this.modelIndexes = []; //indexes of models used by this HUD
    }
    
    load()
    {
        
    }
    
    loadComponents()
    {
        for(let i = 0; i < this.components.length; i++)
        {
            this.components[i].load();
        }
    }
    
    draw()
    {
        for(let i = 0; i < this.components.length; i++)
        {
            this.components[i].draw();
        }
        
        if(this.extraDraw)
        {
            this.extraDraw();
        }
    }
}