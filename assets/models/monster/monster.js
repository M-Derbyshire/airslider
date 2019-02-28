class Monster extends Model {
    constructor()
    {
        super(model);
        
        this.specialLevel = false; //is this on a special level
        
        this.actions = []; //array of methods for each action
        this.currentAction = 0; //the index of the current action
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
        this.actions[this.currentAction](); //run the current action
    }
}