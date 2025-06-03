import { IEventRegistrationDetails } from "../../../../Kernel/entities/Level/IEventManager";
import IModel from "../../../../Kernel/entities/Model/IModel";
import LavaBall from "../../../models/Monsters/attacks/LavaBall/LavaBall";
import Lightning from "../../../models/Monsters/attacks/Lightning/Lightning";
import ElectricHornet from "../../../models/Monsters/ElectricHornet/ElectricHornet";
import Ghost from "../../../models/Monsters/Ghost/Ghost";
import NeonPidgeon from "../../../models/Monsters/NeonPidgeon/NeonPidgeon";
import IntroSnake from "../../../models/Obstacles/IntroObstacles/IntroSnake/IntroSnake";
import Shocker from "../../../models/Obstacles/Shocker/Shocker";
import Snake from "../../../models/Obstacles/Snake/Snake";
import Tarian from "../../../models/Tarian/Tarian";
import neonPidgeonOverlappingEventCheck from "./checks/neonPidgeonOverlappingEventCheck";
import zCollisionEventCheck from "./checks/zCollisionEventCheck";

// This contains the details of all the model events for the game
const standardModelEvents:IEventRegistrationDetails[] = [
    { 
        check: zCollisionEventCheck,
        class1: Tarian,
        class2: Shocker,
        reactionCallback: (t:Tarian, s:Shocker) => {
            t.zCollisionEventAction(s);
            s.hitEventAction();
        }
    },
    {
        check: zCollisionEventCheck,
        class1: Tarian,
        class2: Snake,
        reactionCallback: (t:Tarian, s:Snake) => {
            t.zCollisionEventAction(s);
            s.hitEventAction();
        }
    },
    {
        check: zCollisionEventCheck,
        class1: Tarian,
        class2: IntroSnake,
        reactionCallback: (t:Tarian, s:IntroSnake) => {
            t.zCollisionEventAction(s);
            s.hitEventAction();
        }
    },
    { 
        check: zCollisionEventCheck,
        class1: ElectricHornet,
        class2: Tarian,
        reactionCallback: (eh:ElectricHornet, t:Tarian) => {
            if(eh.isAttacking()) {
                eh.zCollisionEventAction();
                t.zCollisionEventAction(eh);
            }
        }
    },
    { 
        check: zCollisionEventCheck,
        class1: NeonPidgeon,
        class2: Tarian,
        reactionCallback: (np:NeonPidgeon, t:Tarian) => {
            if(np.isAttacking()) {
                np.hitEventAction();
                t.zCollisionEventAction(np);
            }
        }
    },
    { 
        check: neonPidgeonOverlappingEventCheck,
        class1: NeonPidgeon,
        class2: Tarian,
        reactionCallback: (np:NeonPidgeon, _:IModel) => {
            np.overlappingPlayerXEventAction();
        }
    },
    { 
        check: zCollisionEventCheck,
        class1: LavaBall,
        class2: Tarian,
        reactionCallback: (lb:LavaBall, t:Tarian) => {
            if(lb.state === "drop") {
                lb.hitEventAction();
                t.zCollisionEventAction(lb);
            }
        }
    },
    { 
        check: zCollisionEventCheck,
        class1: Tarian,
        class2: Ghost,
        reactionCallback: (t:Tarian, g:Ghost) => {
            t.zCollisionEventAction(g);
            g.zCollisionEventAction(t);
        }
    },
    {
        check: zCollisionEventCheck,
        class1: Tarian,
        class2: Lightning,
        reactionCallback: (t:Tarian, l:Lightning) => {
            t.zCollisionEventAction(l);
        }
    },
];

export default standardModelEvents;