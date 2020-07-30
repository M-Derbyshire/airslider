class UnitHelper
{
    constructor(unitsWithinCamera)
    {
        this.kernel = Kernel.getInstance();
        this.unitsWithinCamera = unitsWithinCamera;
    }
    
    //helpers to create relative positioning/sizings.
    //They give you a certain amount of units (both ways) 
    //within the camera size.
    
    //xUnit and yUnit will take a position/dimension unit value, and provide an actual canvas position/size
    
    xUnit(unit)
    {
        return ((this.kernel.graphicEn.camera.positions.canvas.width / this.unitsWithinCamera) * unit);
    }
    yUnit(unit)
    {
        return ((this.kernel.graphicEn.camera.positions.canvas.height / this.unitsWithinCamera) * unit);
    }
    
    
    //xSpeed and ySpeed will take a unit amount (to be used as a movement speed)
    //and return the actual amount of units that needs to be added to the axis to 
    //give the movement a consistent speed (so it won't be changed by the changing
    //fps)
    
    xSpeed(speed)
    {
        return speed / this.kernel.fps;
    }

    ySpeed(speed)
    {
        return speed / this.kernel.fps;
    }
}