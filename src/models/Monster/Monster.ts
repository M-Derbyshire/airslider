import Kernel from '../../../Kernel/Kernel';
import ASLevel from '../../levels/ASLevel/ASLevel';
import ASModel from '../ASModel/ASModel';
import Tarian from '../Tarian/Tarian';

/**
 * Provides functionality used by all monster models
 */
export default class Monster extends ASModel {
    
    playerModel:Tarian; // The player's model
    damageFlashImage:HTMLImageElement; // Which image should be used by the DamageFlash, in the HUD?
    damageDealt:number; // How much damage should a collision with this monster do?
    
    // Actions are methods that make the monster perform a certain behaviour.
    // They are stored in an array, so they can be ran sequentially.
    protected actions:{():void}[]; // An array of methods, one for each action
    protected currentAction:number; // The index of the currently active action
    
    protected fireWeapon:boolean; // Should this monster be firing its weapon/attack?
    
    protected offScreenUnits:number; // How far off the screen should the monster start (on the x axis)
    protected startY:number; // Where should this model start, on the y axis
    protected startX:number; // Where should this model start, on the x axis
    protected startZ:number; // Where should this model start, on the z axis
    protected enterXSpeed:number; // The speed that the monster should enter at, on the x axis
    protected exitXSpeed:number; // The speed that the monster should exit at, on the x axis
    
    /**
     * Is this monster currently entering the level?
     */
    entering:boolean;
    
    /**
     * Is this monster currently exiting the level?
     */
    exiting:boolean;
    
    /**
     * Constructor
     */
    constructor()
    {
        super();
        
        this.actions = [];
    }
    
    /**
     * Moves on to the next action, or loops back round to the first
     */
    protected nextAction():void
    {
        if(this.currentAction === this.actions.length - 1)
            this.currentAction = 0;
        else
            this.currentAction++;
    }
    
    /**
     * Is this monster currently attacking?
     */
    isAttacking():boolean
    {
        return false;
    }
    
    act():void
    {
        if(this.entering)
            this.enter();
        else if(this.exiting)
            this.exit();
		else
			this.actions[this.currentAction].apply(this);
		
		this._handlePlayerLoss();
    }
	
    /**
     * Starts the monster's entrance
     */
    start():void
    {
        this.active = true;
        this.entering = true;
    }
    
    /**
     * Starts the monster's exit
     */
    stop():void
    {
        this.exiting = true;
    }
    
    
    prepare():void
    {
        super.prepare();
        
        this.currentAction = 0;
        
        this.active = false;
        
        this.entering = false;
        this.exiting = false;
        
        this.fireWeapon = true;
    }
    
    /**
     * The entering sequence for the monster
     */
    enter():void {}
    
    /**
     * The exiting sequence for the monster
     */
    exit():void {}
    
    /**
     * Handles what the monster should do when the player loses
     */
	private _handlePlayerLoss():void
	{
        const level = Kernel.getInstance().level as ASLevel;
        
		if(!level.levelMoving && this.active)
        {
			// Fly/float off into the distance
            this.moveIn(level.maxLevelSpeedRaw);
            this.fireWeapon = false;
            
            if(this.z >= level.vanishingPointDepth)
                this.active = false;
        }
	}
}