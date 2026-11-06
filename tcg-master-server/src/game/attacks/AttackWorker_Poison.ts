import { AttackContext } from "../cards/workers/AttackWorker.js";
import { AttackWorker } from "./AttackWorker.js";

export class AttackWorker_Poison extends AttackWorker {
    private trigger: "coin" | "always";

    public constructor(args: any) {
        super();
        this.trigger = args.trigger ?? "coin";
    }

    public override postEffect(context: AttackContext, knockedOut: boolean): void {
        if (!knockedOut && (this.trigger === "always" || context.game.flipCoin(context.game.players.active.id))) {
            context.game.pokemon.poison(context.game.players.inactive.id, context.defender.id);
        }
    }
};
