import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.AttackTargets)
export class InterruptWorker_AttackTargets extends InterruptWorker {
    public override execute(context: InterruptContext, target_id: number | string, attackName: string, ...targets: (number | string)[]): boolean {
        const player = context.engine.game.activePlayer;
        const card = player.activePokemon!;
        const attack = card.def.attacks.find(a => a.name === attackName)!;
        targets.push(target_id);

        const interrupt = attack.validateTargets(context.engine, ...targets);
        if (interrupt) {
            context.engine.interrupts.interrupt(interrupt);
            return true;
        }

        context.engine.game.attackResult = attack.execute(context.engine, ...targets);
        return true;
    }
};
