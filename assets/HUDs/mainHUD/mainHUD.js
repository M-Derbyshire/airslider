class MainHUD extends HUD
{
    constructor()
    {
        super(HUD);
    }
    
    load()
    {
        this.components.push(new HealthBar(xUnit(0), yUnit(500), xUnit(1000), yUnit(500)));
    }
}