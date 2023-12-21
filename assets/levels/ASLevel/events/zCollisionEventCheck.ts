import IModel from "../../../models/Model/IModel";

/**
 * Tests for a collision event on every axis (x, y, and z) at the same time
 * @param modelA The first model
 * @param modelAActionMethodName The name of the method that should be called on modelA, in response to this event
 * @param modelB The second model
 * @param modelBActionMethodName The name of the method that should be called on modelB, in response to this event
*/
const zCollisionEventCheck = (modelA:IModel, modelAActionMethodName:string, modelB:IModel, modelBActionMethodName:string):void =>
{
    const boxesA = modelA.getBoundaryBoxes();
    const boxesB = modelB.getBoundaryBoxes();
    
    //Not using forEach, as we want to return after the first collision we find
    for(let aIter = 0; aIter < boxesA.length; aIter++)
    {
        const boxA = boxesA[aIter];
        
        for(let bIter = 0; bIter < boxesB.length; bIter++)
        {
            const boxB = boxesB[bIter];
            
            if (
                (boxA.z >= (boxB.z - modelB.zSpeed)) && (boxA.z <= boxB.z) && // Z collision
                (boxA.x + boxA.width >= boxB.x) && (boxA.x <= boxB.x + boxB.width) && // X collision
                (boxA.y + boxA.height >= boxB.y) && (boxA.y <= boxB.y + boxB.height) // Y collision
            )
            {
                (modelA[modelAActionMethodName as keyof typeof modelA] as Function)(modelB);
                (modelB[modelBActionMethodName as keyof typeof modelB] as Function)(modelA);
                return;
            }
        };
    };
};

export default zCollisionEventCheck;