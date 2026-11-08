import { AttackContext } from "../cards/workers/AttackWorker.js";
import { AttackWorker } from "./AttackWorker.js";

export class AttackWorker_Poison extends AttackWorker {
    private trigger: "coin" | "always";

    public constructor(args: any) {
        super();
        this.trigger = args.trigger ?? "coin";
    }

    public override postEffect(context: AttackContext, knockedOut: boolean): void {
        if (!knockedOut && (this.trigger === "always" || context.engine.flipCoin(context.engine.players.active.id))) {
            context.engine.pokemon.poison(context.engine.players.inactive.id, context.defender.id);
        }
    }
};
