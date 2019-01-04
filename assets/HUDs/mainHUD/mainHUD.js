class MainHUD extends HUD
{
    constructor()
    {
        super(HUD);
    }
    
    load()
    {
        this.components.push(new HealthBar(xUnit(100), yUnit(50), xUnit(800), yUnit(60)));
    }
}