import Model from '../../../Kernel/entities/Model/Model';
import ASLevel from '../../levels/ASLevel/ASLevel';
import Kernel from '../../../Kernel/Kernel';
import IModelAnimationsManager from '../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';

/**
 * The game's base Model class
 */
export default class ASModel extends Model 
{   
    damageDealt:number; // If this model can do damage to the player, this is how much health is lost
    canBeControlled:boolean; // Can this model be controlled?
    
    protected spritesheet?:HTMLImageElement; // The spritesheet for the model
    
	/**
     * Constructor
     * @param modelAnimationsManager manages the animations for the model
     */
    constructor(modelAnimationsManager:IModelAnimationsManager)
	{
		super(modelAnimationsManager);
        
		this.damageDealt = 0;
        this.canBeControlled = false;
	}
	
    /**
     * Should handle the level being stopped (e.g. when the player loses, or the level is complete)
     */
    levelStopped() {}
    
    /**
     * Center the model on the x axis
     */
    protected centerXPosition():void
    {
        const unitsWithinCamera = Kernel.getInstance().settings.unitsWithinCameraX;
        this.x = (unitsWithinCamera / 2) - (this.width / 2);
    }
    
    /**
     * Sets the y position of the model, up from the bottom of the screen
     * @param pos the amount of units from the bottom to set the model position
     */
    protected setYPositionFromBottom(pos:number):void
    {
        const unitsWithinCamera = Kernel.getInstance().settings.unitsWithinCameraY;
        this.y = unitsWithinCamera - pos;
    }
    
    /**
     * Calculates a volume value, based on how far away the model is on the Z axis
     * @returns The volume value for any sound effects, based on the model's z position
     */
    protected getVolumeForDistance():number
    {
        // This is the point where the sound should be inaudible
        const soundInaudiblePoint = (Kernel.getInstance().level as ASLevel).vanishingPointDepth / 2;
        
        // First we figure out what the volume should change by if the model moved 1 unit on the z axis
        const singleUnitValue = 1 / soundInaudiblePoint;
        
        // Then we can calculate the correct volume for the current z position (getting quieter the further away it goes)
        const vol = singleUnitValue * (soundInaudiblePoint - this.z);
        
        return (vol >= 0) ? vol : 0;
    }
    
    /**
     * Checks to see if the model is on/below the ground
     * @returns true if the model is on/below the ground, false if not
     */
    protected hasHitGround():boolean
    {
        return (this.y + this.height) >= Kernel.getInstance().settings.unitsWithinCameraY;
    }
}