class ElectricMine extends Model
{
    constructor()
    {
        super(Model);
        
        this._state = "undetonated";
        this._active = false;
		
		this._damageDealt = 5;
		this.blastSpeed = 1000;
		
		this.color = "yellow"; //The damageFlash colour
    }
	
	get damageDealt(){return (this._state === "undetonated") ? this._damageDealt : 0;}
	set damageDealt(val){this._damageDealt = val;}
    
    load(levelLeftEdge, levelRightEdge)
    {
        super.load(levelLeftEdge, levelRightEdge);
        
        let width = 100;
        
        this.animationManager.registerAnimations({
            undetonated: this.animationManager.createAnimation({
                path: "/assets/models/ElectricMine/anim/undetonated",
                frameCount: 1,
                fps: 16,
                width: width,
                height: 70
            }),
			detonated: this.animationManager.createAnimation({
                path: "/assets/models/ElectricMine/anim/detonated",
                frameCount: 1,
                fps: 16,
                width: width,
                height: 70,
				yOffset: 85
            }),
			exploding: this.animationManager.createAnimation({
                path: "/assets/models/ElectricMine/anim/exploding",
                frameCount: 3,
                fps: 16,
                width: width,
                height: 155,
				yOffset: -85,
				nextAnim: "detonated"
            })
        });
        
        this.setYPositionFromBottom(this.height);
        this.z = this.helpers.zCalc.vPointDepth;
		this.active = false;
    }
    
    act()
    {
        if(this.kernel.level.levelSpeed == 0) //updates zSpeed
        {
            this.zSpeed = -(this.helpers.zCalc.speed(this.kernel.level.initialLevelSpeedRaw, this.kernel.fps) / 1.5);
        } else {
            this.zSpeed = this.kernel.level.levelSpeed / 1.5;
        }
        
        this.z -= this.zSpeed; //not using this.moveOut(), as the levelspeed is being reset based on fps -- thus this is as well
        
        if(this.z < 0)
        {
            this.active = false;
        }
    }
    
    zCollisionEventAction(otherModel)
    {
		if(this.state === "undetonated") this.state = "exploding";
    }
}