import { AttackComp_DefenderStatus } from "./AttackComp_DefenderStatus.js";

export class AttackComp_Paralyze extends AttackComp_DefenderStatus {
    public constructor() {
        super({ status: "Paralysis" });
    }
};
