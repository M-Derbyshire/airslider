class Monster extends Model {
    constructor()
    {
        super(Model);
        
        this.specialLevel = false; //is this on a special level
        this.playerIndex;
        this.color;
        this.damageDealt;
        this.zSpeed = 1; //a value is required for Tarian's collision event to work
        
        this.actions = []; //array of methods for each action
        this.currentAction = 0; //the index of the current action
        
        this.active = false;
        
        this.entering = false;
        this.exiting = false;
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
            return;
        }
        
        if(this.exiting)
        {
            this.exit();
            return;
        }
        
        this.actions[this.currentAction](kernel.loadedModels[this.loadedIndex]); //run the current action
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
    
    //meant to be overridden
    enter(){}
    exit(){}
    reset(){}
}