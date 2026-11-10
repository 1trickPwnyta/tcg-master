import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_KarateChop extends AttackWorker {
    public override preEffect(context: AttackContext, damage: number): number {
        return Math.min(0, damage - context.attacker.damage);
    }
};
