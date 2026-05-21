import { IModelEventRegistrationDetails } from "../../../../Kernel/entities/Level/IModelEventManager";
import IModel from "../../../../Kernel/entities/Model/IModel";
import LavaBall from "../../../models/Monsters/attacks/LavaBall/LavaBall";
import Lightning from "../../../models/Monsters/attacks/Lightning/Lightning";
import ElectricHornet from "../../../models/Monsters/ElectricHornet/ElectricHornet";
import Ghost from "../../../models/Monsters/Ghost/Ghost";
import NeonPidgeon from "../../../models/Monsters/NeonPidgeon/NeonPidgeon";
import GangMember from "../../../models/Obstacles/GangMember/GangMember";
import IntroGangMember from "../../../models/Obstacles/IntroObstacles/IntroGangMember/IntroGangMember";
import IntroRockBall from "../../../models/Obstacles/IntroObstacles/IntroRockBall/IntroRockBall";
import IntroSnake from "../../../models/Obstacles/IntroObstacles/IntroSnake/IntroSnake";
import Jellyfish from "../../../models/Obstacles/Jellyfish/Jellyfish";
import RockBall from "../../../models/Obstacles/RockBall/RockBall";
import Skeleton from "../../../models/Obstacles/Skeleton/Skeleton";
import Snake from "../../../models/Obstacles/Snake/Snake";
import Tarian from "../../../models/Tarian/Tarian";
import neonPidgeonOverlappingEventCheck from "./checks/neonPidgeonOverlappingEventCheck";
import zCollisionEventCheck from "./checks/zCollisionEventCheck";

// This contains the details of all the model events for the game
const standardModelEvents:IModelEventRegistrationDetails[] = [
    {
        check: zCollisionEventCheck,
        class1: Tarian,
        class2: Snake,
        reactionCallback: (t, s) => {
            (t as Tarian).zCollisionEventAction(s);
            (s as Snake).hitEventAction();
        }
    },
    {
        check: zCollisionEventCheck,
        class1: Tarian,
        class2: IntroSnake,
        reactionCallback: (t, s) => {
            (t as Tarian).zCollisionEventAction(s);
            (s as IntroSnake).hitEventAction();
        }
    },
    {
        check: zCollisionEventCheck,
        class1: Tarian,
        class2: RockBall,
        reactionCallback: (t, rb) => {
            (t as Tarian).zCollisionEventAction(rb);
            (rb as RockBall).hitEventAction();
        }
    },
    {
        check: zCollisionEventCheck,
        class1: Tarian,
        class2: IntroRockBall,
        reactionCallback: (t, rb) => {
            (t as Tarian).zCollisionEventAction(rb);
            (rb as IntroRockBall).hitEventAction();
        }
    },
    {
        check: zCollisionEventCheck,
        class1: Tarian,
        class2: GangMember,
        reactionCallback: (t, gm) => {
            (t as Tarian).zCollisionEventAction(gm);
            (gm as GangMember).hitEventAction();
        }
    },
    {
        check: zCollisionEventCheck,
        class1: Tarian,
        class2: IntroGangMember,
        reactionCallback: (t, gm) => {
            (t as Tarian).zCollisionEventAction(gm);
            (gm as IntroGangMember).hitEventAction();
        }
    },
    {
        check: zCollisionEventCheck,
        class1: Tarian,
        class2: Skeleton,
        reactionCallback: (t, s) => {
            (t as Tarian).zCollisionEventAction(s);
            (s as Skeleton).hitEventAction();
        }
    },
    {
        check: zCollisionEventCheck,
        class1: Tarian,
        class2: Jellyfish,
        reactionCallback: (t, j) => {
            (t as Tarian).zCollisionEventAction(j);
            (j as Jellyfish).hitEventAction();
        }
    },
    { 
        check: zCollisionEventCheck,
        class1: ElectricHornet,
        class2: Tarian,
        reactionCallback: (eh, t) => {
            if((eh as ElectricHornet).isAttacking()) {
                (eh as ElectricHornet).zCollisionEventAction();
                (t as Tarian).zCollisionEventAction(eh);
            }
        }
    },
    { 
        check: zCollisionEventCheck,
        class1: NeonPidgeon,
        class2: Tarian,
        reactionCallback: (np, t) => {
            if((np as NeonPidgeon).isAttacking()) {
                (np as NeonPidgeon).hitEventAction();
                (t as Tarian).zCollisionEventAction(np);
            }
        }
    },
    { 
        check: neonPidgeonOverlappingEventCheck,
        class1: NeonPidgeon,
        class2: Tarian,
        reactionCallback: (np, _:IModel) => {
            (np as NeonPidgeon).overlappingPlayerXEventAction();
        }
    },
    { 
        check: zCollisionEventCheck,
        class1: LavaBall,
        class2: Tarian,
        reactionCallback: (lb, t) => {
            if(lb.state === "drop") {
                (lb as LavaBall).hitEventAction();
                (t as Tarian).zCollisionEventAction(lb);
            }
        }
    },
    { 
        check: zCollisionEventCheck,
        class1: Tarian,
        class2: Ghost,
        reactionCallback: (t, g) => {
            (t as Tarian).zCollisionEventAction(g);
            (g as Ghost).zCollisionEventAction(t);
        }
    },
    {
        check: zCollisionEventCheck,
        class1: Tarian,
        class2: Lightning,
        reactionCallback: (t, l) => {
            (t as Tarian).zCollisionEventAction(l);
        }
    },
];

export default standardModelEvents;