import Model from '../Model/Model';
import ASLevel from '../../levels/ASLevel/ASLevel';

export default class ASModel extends Model {
	
    protected levelLeftEdge:number;
    protected levelRightEdge:number;
    
    damageDealt:number;
    canBeControlled:boolean;
    
	constructor()
	{
		super();
		
        this.levelLeftEdge;
        this.levelRightEdge;
		
		this.damageDealt = 0;
        this.canBeControlled = false;
	}
	
    /**
     * Should handle the level being stopped
     */
    protected levelStopped() {}
    
    /**
     * Center the model on the x axis
     */
    protected centerXPosition():void
    {
        this.x = (this.kernel.unitsWithinCamera / 2) - (this.width / 2);
    }
    
    /**
     * Sets the y position of the model, from the bottom
     * @param pos the amount of units from the bottom to set the model position
     */
    protected setYPositionFromBottom(pos:number):void
    {
        this.y = this.kernel.unitsWithinCamera - pos;
    }
	
	load():void
    {
        super.load();
    }
    
    prepare():void
    {
        this.levelLeftEdge = (this.kernel.level as ASLevel).leftEdge;
        this.levelRightEdge = (this.kernel.level as ASLevel).rightEdge;
    }
}