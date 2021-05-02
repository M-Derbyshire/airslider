import Kernel from '../../../kernel/Kernel';

class EventCheckContainer
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
    }
    
    //Place any event check methods here, so they can be called by the EventManager
    
    //All events will take a reference to the first model, the name of the first model's
    //action method for this event, a reference to the second model, and then the name of 
    //the second model's action method for this event.
    
    //Every model's action method is passed a reference to the other model.
    
    zCollisionEventCheck(modelA, modelAActionMethodName, modelB, modelBActionMethodName)
    {
        if (modelB.active && 
        ((modelA.z >= (modelB.z - modelB.zSpeed)) && (modelA.z <= modelB.z)) &&
        (modelA.x + modelA.width >= modelB.x) &&
        (modelA.x <= modelB.x + modelB.width) &&
        (modelA.y + modelA.height >= modelB.y) &&
        (modelA.y <= modelB.y + modelB.height))
        {
            modelA[modelAActionMethodName](modelB);
            modelB[modelBActionMethodName](modelA);
        }
    }
    
    hitPlayerOrGroundEventCheck(modelA, modelAActionMethodName, modelB, modelBActionMethodName)
    {
        if((modelA.x + modelA.width >= modelB.x) &&
        (modelA.x <= modelB.x + modelB.width) &&
        (modelA.y + modelA.height >= modelB.y) &&
        (modelA.y <= modelB.y + modelB.height))
        {
            modelA[modelAActionMethodName](modelB);
            modelB[modelBActionMethodName](modelA);
        }
        else if(modelA.y + modelA.height >= this.kernel.unitsWithinCamera)
        {
            modelA[modelAActionMethodName](modelB);
        }
    }
    
    //NeonPidgeon events
    neonPidgeonOverlappingEventCheck(modelA, modelAActionMethodName, modelB, modelBActionMethodName)
    {
        if(((modelA.x + modelA.width) >= modelB.x) &&
        (modelA.x <= (modelB.x + modelB.width)))
        {
            //Other model doesn't have an action for this
            modelA[modelAActionMethodName](modelB);
        }
    }
    
    
    
}