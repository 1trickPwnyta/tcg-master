import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_Paralyze extends AttackWorker {
    private trigger: "coin" | "always";

    public constructor(args: any) {
        super();
        this.trigger = args.trigger ?? "coin";
    }

    public override postEffect(context: AttackContext, knockedOut: boolean): void {
        if (!knockedOut && (this.trigger === "always" || context.engine.flipCoin(context.engine.players.active.id))) {
            context.engine.pokemon.paralyze(context.engine.players.inactive.id, context.defender.id);
        }
    }
};
