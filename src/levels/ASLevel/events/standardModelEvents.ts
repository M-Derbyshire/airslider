import { IEventDetails } from "../../../../Kernel/entities/Level/IEventManager";
import LavaBall from "../../../models/Monsters/attacks/LavaBall/LavaBall";
import Lightning from "../../../models/Monsters/attacks/Lightning/Lightning";
import ElectricHornet from "../../../models/Monsters/ElectricHornet/ElectricHornet";
import Ghost from "../../../models/Monsters/Ghost/Ghost";
import NeonPidgeon from "../../../models/Monsters/NeonPidgeon/NeonPidgeon";
import Shocker from "../../../models/Obstacles/Shocker/Shocker";
import Tarian from "../../../models/Tarian/Tarian";
import hitPlayerOrGroundEventCheck from "./checks/hitPlayerOrGroundEventCheck";
import neonPidgeonOverlappingEventCheck from "./checks/neonPidgeonOverlappingEventCheck";
import zCollisionEventCheck from "./checks/zCollisionEventCheck";

// This contains the details of all the model events for the game
const standardModelEvents:IEventDetails[] = [
    { 
        eventCheck: zCollisionEventCheck,
        class1: Tarian,
        class1EventActionName: "zCollisionEventAction",
        class2: Shocker,
        class2EventActionName: "zCollisionEventAction"
    },
    { 
        eventCheck: zCollisionEventCheck,
        class1: ElectricHornet,
        class1EventActionName: "zCollisionEventAction",
        class2: Tarian,
        class2EventActionName: "zCollisionEventAction"
    },
    { 
        eventCheck: hitPlayerOrGroundEventCheck,
        class1: NeonPidgeon,
        class1EventActionName: "hitPlayerOrGroundEventAction",
        class2: Tarian,
        class2EventActionName: "zCollisionEventAction"
    },
    { 
        eventCheck: neonPidgeonOverlappingEventCheck,
        class1: NeonPidgeon,
        class1EventActionName: "neonPidgeonOverlappingEventAction",
        class2: Tarian,
        class2EventActionName: "" //Doesn't have one, and doesn't try to call one
    },
    { 
        eventCheck: hitPlayerOrGroundEventCheck,
        class1: LavaBall,
        class1EventActionName: "hitPlayerOrGroundEventAction",
        class2: Tarian,
        class2EventActionName: "zCollisionEventAction"
    },
    { 
        eventCheck: zCollisionEventCheck,
        class1: Tarian,
        class1EventActionName: "zCollisionEventAction",
        class2: Ghost,
        class2EventActionName: "zCollisionEventAction"
    },
    {
        eventCheck: zCollisionEventCheck,
        class1: Tarian,
        class1EventActionName: "zCollisionEventAction",
        class2: Lightning,
        class2EventActionName: "hitPlayerEventAction"
    },
];

export default standardModelEvents;