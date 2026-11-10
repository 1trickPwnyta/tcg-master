import { StatusContext, StatusWorker } from "./StatusWorker.js";

export class StatusWorker_LeekSlap extends StatusWorker {
    public override canUseAttack(_context: StatusContext, attackName: string): boolean {
        return attackName !== "Leek Slap";
    }
};
