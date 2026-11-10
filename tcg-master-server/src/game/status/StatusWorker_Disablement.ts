import { StatusContext, StatusWorker } from "./StatusWorker.js";

export class StatusWorker_Disablement extends StatusWorker {
    public override notify_given(context: StatusContext, args: any): void {
        context.engine.send(...context.card.fullTokens, "'s", args.attack_name, "was disabled.");
    }

    public override canUseAttack(context: StatusContext, attackName: string, args: any): boolean {
        return attackName !== args.attack_name;
    }

    public override notify_endOfTurn(context: StatusContext, turn_id: number): void {
        if (context.owner.id === turn_id) {
            this.remove(context);
        }
    }
};
