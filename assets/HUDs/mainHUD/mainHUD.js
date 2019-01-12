class MainHUD extends HUD
{
    constructor()
    {
        super(HUD);
        
        this.damageFlash;
    }
    
    load()
    {
        this.components.push(new HealthBar(xUnit(100), yUnit(50), xUnit(800), yUnit(60)));
        this.damageFlash = new DamageFlash();
        
        for(let i = 0; i < this.components.length; i++)
        {
            this.components[i].load();
        }
        
        this.damageFlash.load();
    }
    
    extraDraw()
    {
        this.damageFlash.draw();
        if(this.damageFlash.opacity > 0)
        {
            this.update = true;
        }
    }
}