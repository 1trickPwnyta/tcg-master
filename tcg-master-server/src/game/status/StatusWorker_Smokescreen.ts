import { StatusContext, StatusWorker } from "./StatusWorker.js";

export class StatusWorker_Smokescreen extends StatusWorker {
    public override modifyDamageDealt(context: StatusContext, amount: number): number {
        if (!context.engine.game.flipCoin(context.card.owner)) {
            context.engine.send("The attack did nothing.");
            return -1;
        } else {
            return amount;
        }
    }

    public override notify_endOfTurn(context: StatusContext, turn_id: number): void {
        if (context.owner.id === turn_id) {
            this.remove(context);
        }
    }
};
