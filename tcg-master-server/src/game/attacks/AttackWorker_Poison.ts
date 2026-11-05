import { AttackContext } from "../cards/workers/AttackWorker.js";
import { AttackWorker } from "./AttackWorker.js";

export class AttackWorker_Poison extends AttackWorker {
    public constructor(args: any) {
        super();
        this.trigger = args.trigger ?? "coin";
    }

    protected override executeWorker(context: AttackContext): void {
        context.game.pokemon.poison(context.game.players.inactive.id, context.defender.id);
    }
};
