import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_Meditate extends AttackWorker {
    public override preEffect(context: AttackContext, damage: number): number {
        return damage + context.defender.damage;
    }
};
