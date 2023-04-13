import Kernel from '../../../Kernel/Kernel';
import IKernel from '../../../Kernel/IKernel';
import IModel from '../../models/Model/IModel';

/**
 * A container for any event-check methods
 */
export default class EventCheckContainer
{
    private _kernel:IKernel;
    
    /**
     * Constructor
     */
    constructor()
    {
        this._kernel = Kernel.getInstance();
    }
    
    
    //Place any event check methods here, so they can be called by the EventManager
    
    //All events will take a reference to the first model, the name of the first model's
    //action method for this event, a reference to the second model, and then the name of 
    //the second model's action method for this event.
    
    //Every model's action method is passed a reference to the other model.
    
    zCollisionEventCheck(modelA:IModel, modelAActionMethodName:string, modelB:IModel, modelBActionMethodName:string):void
    {
        const boxesA = modelA.getBoundaryBoxes();
        const boxesB = modelB.getBoundaryBoxes();
        
        for(let aIter = 0; aIter < boxesA.length; aIter++)
        {
            const boxA = boxesA[aIter];
            
            for(let bIter = 0; bIter < boxesB.length; bIter++)
            {
                const boxB = boxesB[bIter];
                
                if (modelB.active && 
                ((boxA.z >= (boxB.z - modelB.zSpeed)) && (boxA.z <= boxB.z)) &&
                (boxA.x + boxA.width >= boxB.x) &&
                (boxA.x <= boxB.x + boxB.width) &&
                (boxA.y + boxA.height >= boxB.y) &&
                (boxA.y <= boxB.y + boxB.height))
                {
                    modelA[modelAActionMethodName](modelB);
                    modelB[modelBActionMethodName](modelA);
                }
            }
        }
    }
    
    hitPlayerOrGroundEventCheck(modelA:IModel, modelAActionMethodName:string, modelB:IModel, modelBActionMethodName:string):void
    {
        //Ground hit check
        if(modelA.y + modelA.height >= this._kernel.unitsWithinCamera)
        {
            modelA[modelAActionMethodName](modelB);
            return;
        }
        
        const boxesA = modelA.getBoundaryBoxes();
        const boxesB = modelB.getBoundaryBoxes();
        
        //Not using forEach, as we want to return after the first collision found
        for(let aIter = 0; aIter < boxesA.length; aIter++)
        {
            const boxA = boxesA[aIter];
            
            for(let bIter = 0; bIter < boxesB.length; bIter++)
            {
                const boxB = boxesB[bIter];
                
                if((boxA.x + boxA.width >= boxB.x) &&
                (boxA.x <= boxB.x + boxB.width) &&
                (boxA.y + boxA.height >= boxB.y) &&
                (boxA.y <= boxB.y + boxB.height))
                {
                    modelA[modelAActionMethodName](modelB);
                    modelB[modelBActionMethodName](modelA);
                    return;
                }
            }
        }
    }
    
    //NeonPidgeon events
    neonPidgeonOverlappingEventCheck(modelA:IModel, modelAActionMethodName:string, modelB:IModel, modelBActionMethodName:string):void
    {
        if(((modelA.x + modelA.width) >= modelB.x) &&
        (modelA.x <= (modelB.x + modelB.width)))
        {
            //Other model doesn't have an action for this
            modelA[modelAActionMethodName](modelB);
        }
    }
    
    
    
}