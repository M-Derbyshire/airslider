import Model from '/assets/models/Model/Model';

export default class ElectricMine extends Model
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
        
        const width = 100;
		const fps = 12
        
        this.animationManager.registerAnimations({
            undetonated: this.animationManager.createAnimation({
                path: "/assets/models/ElectricMine/anim/undetonated",
                frameCount: 3,
                fps: fps,
                width: width,
                height: 155
            }),
			detonated: this.animationManager.createAnimation({
                path: "/assets/models/ElectricMine/anim/detonated",
                frameCount: 1,
                fps: fps,
                width: width,
                height: 70,
				yOffset: 85
            }),
			retracting: this.animationManager.createAnimation({
                path: "/assets/models/ElectricMine/anim/retracting",
                frameCount: 3,
                fps: fps,
                width: width,
                height: 155,
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
			this.state = "undetonated";
            this.active = false;
        }
    }
    
    zCollisionEventAction(otherModel)
    {
		if(this.state === "undetonated") this.state = "retracting";
    }
}