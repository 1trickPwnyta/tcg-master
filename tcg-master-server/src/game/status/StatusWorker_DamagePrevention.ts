import { StatusContext, StatusWorker } from "./StatusWorker.js";

export class StatusWorker_DamagePrevention extends StatusWorker {
    public override modifyDamageTaken(_context: StatusContext, amount: number, args: any): number {
        if (args.buffer && amount <= args.buffer) {
            amount = 0;
        }
        if (args.amount) {
            amount -= (args.amount === "all" ? amount : args.amount);
        }
        return amount;
    }

    public override notify_endOfTurn(context: StatusContext, turn_id: number) {
        if (turn_id === context.card.owner.opponent.id) {
            this.remove(context);
        }
    }
};
