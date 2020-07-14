class UnitHelper
{
    constructor(unitsWithinCameraX, unitsWithinCameraY)
    {
        this.kernel = Kernel.getInstance();
        this.unitsWithinCamera = {
            x: unitsWithinCameraX,
            y: unitsWithinCameraY
        };
    }
    
    //helpers to create relative positioning/sizings.
    //They give you a certain amount of units (both ways) 
    //within the camera size.
    xUnit(unit)
    {
        return (this.kernel.graphicEn.gameCan.width / this.unitsWithinCamera.x) * unit;
    }
    yUnit(unit)
    {
        return (this.kernel.graphicEn.gameCan.height / this.unitsWithinCamera.y) * unit;
    }

    xSpeed(speed)
    {
        return this.xUnit(speed) / this.kernel.fps;
    }

    ySpeed(speed)
    {
        return this.yUnit(speed) / this.kernel.fps;
    }   
}