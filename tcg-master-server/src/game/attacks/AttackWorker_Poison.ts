import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_Poison extends AttackWorker {
    private trigger: "coin" | "always";

    public constructor(args: any) {
        super();
        this.trigger = args.trigger ?? "coin";
    }

    public override postEffect(context: AttackContext, knockedOut: boolean) {
        if (!knockedOut && (this.trigger === "always" || context.engine.game.flipCoin(context.engine.game.activePlayer))) {
            context.defender.poison();
        }
    }
};
