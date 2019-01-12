class HUD
{
    constructor()
    {
        this.update = true; //does the HUD need updating? Initially true, so it will get drawn in the first frame
        this.components = []; //HUD components included
        this.modelIndexes = []; //indexes of models used by this HUD
    }
    
    //meant to be overriden
    load(){}
    
    draw()
    {
        for(let i = 0; i < this.components.length; i++)
        {
            this.components[i].draw();
        }
        
        this.update = false;
        
        if(this.extraDraw)
        {
            this.extraDraw();
        }
    }
}