import { eventCheck, eventReactionCallback } from "../../../../../Kernel/entities/Level/IModelEventManager";
import IModel from "../../../../../Kernel/entities/Model/IModel";

/**
 * Tests for a collision event on every axis (x, y, and z) at the same time
 * @param modelA The first model
 * @param modelB The second model
 * @param reactionCallback callback that will be called if the event occurs
*/
const zCollisionEventCheck:eventCheck = (modelA:IModel, modelB:IModel, reactionCallback:eventReactionCallback):void =>
{
    const boxesA = modelA.getHitBoxes();
    const boxesB = modelB.getHitBoxes();
    
    // The zSpeed of modelB is used as a "depth" for the model. However, if it 
    // isn't set (or it's a large value, which can be unrealistic), we want a default value instead.
    const zDepthDefault = 10;
    const modelBZDepth = (modelB.zSpeed && modelB.zSpeed < 10)
        ? modelB.zSpeed
        : zDepthDefault;
    
    // Not using forEach, as we want to return after the first collision we find
    for(let aIter = 0; aIter < boxesA.length; aIter++)
    {
        const boxA = boxesA[aIter];
        
        for(let bIter = 0; bIter < boxesB.length; bIter++)
        {
            const boxB = boxesB[bIter];
            
            if (
                (boxA.z >= (boxB.z - modelBZDepth)) && (boxA.z <= boxB.z) && // Z collision
                (boxA.x + boxA.width >= boxB.x) && (boxA.x <= boxB.x + boxB.width) && // X collision
                (boxA.y + boxA.height >= boxB.y) && (boxA.y <= boxB.y + boxB.height) // Y collision
            )
            {
                reactionCallback(modelA, modelB);
                return;
            }
        };
    };
};

export default zCollisionEventCheck;