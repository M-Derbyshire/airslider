class MainHUD extends HUD
{
    constructor()
    {
        super(HUD);
        
        this.damageFlash;
    }
    
    load()
    {
        this.components.push(new HealthBar(100, 50, 800, 60, 0)); //0 will always be the player's index
        
        //This is not in the component array, as needs to be called
        //by the player's character model
        this.damageFlash = new DamageFlash();
        
        this.loadComponents();
        
        this.damageFlash.loadSuper();
        this.damageFlash.load();
    }
    
    extraDraw()
    {
        //This is not in the component array, as needs to be called
        //by the player's character model
        this.damageFlash.draw();
    }
}