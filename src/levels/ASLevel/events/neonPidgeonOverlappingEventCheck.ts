import IModel from "../../../../Kernel/entities/Model/IModel";

/**
 * This is used to test if 2 NeonPidgeon monsters are currently overlapping on the X-axis.
 * @param modelA The first model
 * @param modelAActionMethodName The name of the method that should be called on modelA, in response to this event
 * @param modelB The second model
 * @param modelBActionMethodName The name of the method that should be called on modelB, in response to this event
 */
const neonPidgeonOverlappingEventCheck = (modelA:IModel, modelAActionMethodName:string, modelB:IModel, modelBActionMethodName:string):void =>
{
    const overlapIndent = modelB.width * 0.2; // Add an extra "indent", before this is considered an overlap
    
    if(
        ((modelA.x + modelA.width) >= (modelB.x + overlapIndent)) &&
        (modelA.x <= (modelB.x + modelB.width - overlapIndent))
    )
    {
        //The other model doesn't need to have an action for this
        (modelA[modelAActionMethodName as keyof typeof modelA] as Function)(modelB);
    }
};

export default neonPidgeonOverlappingEventCheck;