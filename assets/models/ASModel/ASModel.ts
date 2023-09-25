import Model from '../Model/Model';
import ASLevel from '../../levels/ASLevel/ASLevel';
import IModelAnimationsManager from '../Model/ModelAnimationsManager/IModelAnimationsManager';

export default class ASModel extends Model {
	
    protected levelLeftEdge:number;
    protected levelRightEdge:number;
    
    damageDealt:number;
    canBeControlled:boolean;
    
	constructor()
	{
		super();
        
		this.damageDealt = 0;
        this.canBeControlled = false;
	}
	
    /**
     * Should handle the level being stopped
     */
    levelStopped() {}
    
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
    
    /**
     * Calculates a volume value, based on how far 
     * @returns The volume value for any sound effects, based on the model's z position
     */
    protected getVolumeForDistance():number
    {
        // This is the point where the sound should be inaudible
        const soundInaudiblePoint = this.kernel.helpers.zCalc.vPointDepth / 2;
        
        // First we figure out what the volume should change by if the model moved 1 unit on the z axis
        const singleUnitValue = 1 / soundInaudiblePoint;
        
        // Then we can calculate the correct volume for the current z position (getting quieter the further away it goes)
        const vol = singleUnitValue * (soundInaudiblePoint - this.z);
        return (vol >= 0) ? vol : 0;
    }
	
	load(animationManager:IModelAnimationsManager):void
    {
        super.load(animationManager);
    }
    
    prepare():void
    {
        super.prepare();
        
        this.levelLeftEdge = (this.kernel.level as ASLevel).leftEdge;
        this.levelRightEdge = (this.kernel.level as ASLevel).rightEdge;
    }
}