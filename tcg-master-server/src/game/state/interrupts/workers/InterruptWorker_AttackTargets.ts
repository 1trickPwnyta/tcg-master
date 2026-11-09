import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.AttackTargets)
export class InterruptWorker_AttackTargets extends InterruptWorker {
    public override execute(context: InterruptContext, target_id: number, attackName: string, ...targets: number[]): boolean {
        const player = context.engine.game.activePlayer;
        const card = player.activePokemon!;
        const attack = card.def.attacks.find(a => a.name === attackName)!;
        return attack.execute({
            engine: context.engine,
            attack: attack,
            attacker: card,
            defender: context.engine.game.defendingPokemon!
        }, ...targets, target_id);
    }
};
