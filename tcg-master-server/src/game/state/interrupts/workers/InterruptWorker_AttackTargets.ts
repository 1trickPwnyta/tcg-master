import { PokemonCardDef } from "../../../../defs/PokemonCardDef.js";
import { DefDatabase } from "../../../../defs/DefDatabase.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.AttackTargets)
export class InterruptWorker_AttackTargets extends InterruptWorker {
    public override execute(context: InterruptContext, target_id: number, attack_id: string): boolean {
        const player = context.game.players.active;
        const card = player.active.cards[0];
        const worker = DefDatabase.get<PokemonCardDef>(card.def);
        const attack = worker.attacks.find(a => a.name === attack_id)!;
        return attack.execute({
            game: context.game,
            state: context.state,
            attacker: card,
            defender: context.game.players.inactive.active.cards[0]
        }, target_id);
    }
};
