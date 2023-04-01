import ASModel from '/assets/models/ASModel/ASModel';

export default class Monster extends ASModel {
    constructor()
    {
        super(ASModel);
        
        this.specialLevel = false; //is this on a special level
        this.playerModel;
        this.color;
        this.damageDealt;
        this.zSpeed = 1; //a value is required for Tarian's collision event to work
        
        this.actions = []; //array of methods for each action
        this.currentAction = 0; //the index of the current action
        
        this.active = false;
        
        this.entering = false;
        this.exiting = false;
        
        this.fireWeapon = true;
    }
    
    nextAction()
    {
        if(this.currentAction == (this.actions.length - 1))
        {
            this.currentAction = 0;
        } else {
            this.currentAction++;
        }
    }
    
    act()
    {
        if(this.entering)
        {
            this.enter();
        }
        else if(this.exiting)
        {
            this.exit();
        }
		else
		{
			this.actions[this.currentAction].apply(this);
		}
		
		this._handlePlayerLoss();
    }
	
	_handlePlayerLoss()
	{
		//If we (the player) has stopped moving forward (lost)
		if(this.kernel.level.levelSpeedRaw < this.realZSpeedRaw && this.active)
        {
			//Fly/float off into the distance
            this.z += (this.helpers.zCalc.speed(this.realZSpeedRaw, this.kernel.fps) - this.helpers.zCalc.speed(this.kernel.level.levelSpeed, this.kernel.fps));
            this.fireWeapon = false;
            
            if(this.z >= this.helpers.zCalc.vPointDepth)
            {
                this.active = false;
            }
        }
	}
	
	
    
    start()
    {
        this.active = true;
        this.entering = true;
    }
    
    stop()
    {
        this.exiting = true;
    }
    
    
    prepare()
    {
        super.prepare();
        this.fireWeapon = true;
        this.realZSpeedRaw = this.kernel.level.levelSpeedRaw;
    }
    
    //meant to be overridden
    enter(){}
    exit(){}
    reset(){}
}