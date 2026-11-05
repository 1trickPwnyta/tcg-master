import { AttackContext } from "../cards/workers/AttackWorker.js";

export abstract class AttackWorker {
    protected trigger: "coin" | "always" = "always";

    public execute(context: AttackContext) {
        if (this.trigger === "always" || context.game.flipCoin(context.game.players.active.id)) {
            this.executeWorker(context);
        }
    }

    protected abstract executeWorker(context: AttackContext): void;
};
