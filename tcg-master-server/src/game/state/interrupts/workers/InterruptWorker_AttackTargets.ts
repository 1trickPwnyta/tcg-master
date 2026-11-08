import { PokemonCardDef } from "../../../../defs/PokemonCardDef.js";
import { DefDatabase } from "../../../../defs/DefDatabase.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.AttackTargets)
export class InterruptWorker_AttackTargets extends InterruptWorker {
    public override execute(context: InterruptContext, target_id: number, attackName: string, ...targets: number[]): boolean {
        const player = context.engine.players.active;
        const card = player.active.cards[0];
        const def = DefDatabase.get<PokemonCardDef>(card.def);
        const attack = def.attacks.find(a => a.name === attackName)!;
        return attack.execute({
            engine: context.engine,
            attack: attack,
            attacker: card,
            defender: context.engine.players.inactive.active.cards[0]
        }, ...targets, target_id);
    }
};
