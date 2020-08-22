class MainHUD extends HUD
{
    constructor()
    {
        super(HUD);
        
        this.damageFlash;
    }
    
    load(canvasCtx, camera)
    {
        super.load(canvasCtx, camera);
        
        this.components.push(new HealthBar(100, 50, 800, 60, 0)); //0 will always be the player's index
        this.loadComponents(canvasCtx, camera);
        //This is not in the component array, as needs to be called
        //by the player's character model
        this.damageFlash = new DamageFlash();
        
        this.damageFlash.load(canvasCtx, camera);
    }
    
    extraDraw()
    {
        //This is not in the component array, as needs to be called
        //by the player's character model
        this.damageFlash.draw();
    }
}