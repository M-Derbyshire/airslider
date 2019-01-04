class MainHUD extends HUD
{
    constructor()
    {
        super(HUD);
    }
    
    load()
    {
        this.components.push(new HealthBar(0, 0, 10, 10));
    }
}