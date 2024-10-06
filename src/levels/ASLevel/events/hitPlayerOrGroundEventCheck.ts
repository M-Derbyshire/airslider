import Kernel from "../../../../Kernel/Kernel";
import IModel from "../../../../Kernel/entities/Model/IModel";

/**
 * This will first test if modelA has hit the ground. If that is not the case, it will test is modelA has hit 
 * modelB on the X & Y axis'
 * @param modelA The first model
 * @param modelAActionMethodName The name of the method that should be called on modelA, in response to this event
 * @param modelB The second model
 * @param modelBActionMethodName The name of the method that should be called on modelB, in response to this event
 */
const hitPlayerOrGroundEventCheck = (modelA:IModel, modelAActionMethodName:string, modelB:IModel, modelBActionMethodName:string):void =>
{
    //Ground hit check
    if(modelA.y + modelA.height >= Kernel.getInstance().unitsWithinCameraY)
    {
        (modelA[modelAActionMethodName as keyof typeof modelA] as Function)(modelB);
        return;
    }
    
    const boxesA = modelA.getHitBoxes();
    const boxesB = modelB.getHitBoxes();
    
    //Not using forEach, as we want to return after the first collision we find
    for(let aIter = 0; aIter < boxesA.length; aIter++)
    {
        const boxA = boxesA[aIter];
        
        for(let bIter = 0; bIter < boxesB.length; bIter++)
        {
            const boxB = boxesB[bIter];
            
            if(
                (boxA.x + boxA.width >= boxB.x) && (boxA.x <= boxB.x + boxB.width) && // X collision
                (boxA.y + boxA.height >= boxB.y) && (boxA.y <= boxB.y + boxB.height) // Y collision
            )
            {
                (modelA[modelAActionMethodName as keyof typeof modelA] as Function)(modelB);
                (modelB[modelBActionMethodName as keyof typeof modelB] as Function)(modelA);
                return;
            }
        }
    }
};

export default hitPlayerOrGroundEventCheck;