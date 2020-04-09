class UnitHelpers
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
    }
    
    //helpers to create relative positioning/sizings
    //they give you 1000 units (both ways) to play with
    xUnit(unit)
    {
        return (this.kernel.graphicEn.gameCan.width / 1000) * unit;
    }
    yUnit(unit)
    {
        return (this.kernel.graphicEn.gameCan.height / 1000) * unit;
    }

    xSpeed(speed)
    {
        return xUnit(speed) / this.kernel.fps;
    }

    ySpeed(speed)
    {
        return yUnit(speed) / this.kernel.fps;
    }   
}