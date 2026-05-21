import { eventCheck, eventReactionCallback } from "../../../../../Kernel/entities/Level/IModelEventManager";
import IModel from "../../../../../Kernel/entities/Model/IModel";

/**
 * This is used to test if 2 NeonPidgeon monsters are currently overlapping on the X-axis.
 * @param modelA The first model
 * @param modelB The second model
 * @param reactionCallback callback that will be called if the event occurs
 */
const neonPidgeonOverlappingEventCheck:eventCheck = (modelA:IModel, modelB:IModel, reactionCallback:eventReactionCallback):void =>
{
    const overlapIndent = modelB.width * 0.2; // Add an extra "indent", before this is considered an overlap
    
    if(
        ((modelA.x + modelA.width) >= (modelB.x + overlapIndent)) &&
        (modelA.x <= (modelB.x + modelB.width - overlapIndent))
    )
    {
        reactionCallback(modelA, modelB);
    }
};

export default neonPidgeonOverlappingEventCheck;