class HUDComponent
{
    constructor(x, y, width, height, state = null)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.state = state;
    }
    
    //meant to be overriden
    draw(){}
}