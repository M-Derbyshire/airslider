class HUD
{
    constructor()
    {
        this.update = true; //does the HUD need updating? Initially true, so it will get drawn in the first frame
        this.components = []; //HUD components included
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
    }
    
    addComponent(component, x, y, width, height, state = null)
    {
        this.components.push(component);
        let i = this.components.length - 1; //index of the new component
        
        this.components[i].x = x;
        this.components[i].y = y;
        this.components[i].width = width;
        this.components[i].height = height;
        this.components[i].state = state;
    }
}