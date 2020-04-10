class MainHUD extends HUD
{
    constructor()
    {
        super(HUD);
        
        this.damageFlash;
    }
    
    load()
    {
        let unitHelper = this.helpers.unit;
        this.components.push(new HealthBar(
            unitHelper.xUnit(100), 
            unitHelper.yUnit(50), 
            unitHelper.xUnit(800), 
            unitHelper.yUnit(60),
            0 //Will always be the index of the player's model
        ));
        
        //This is not in the component array, as needs to be called
        //by the player's character model
        this.damageFlash = new DamageFlash();
        
        this.loadComponents();
        
        this.damageFlash.loadSuper();
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