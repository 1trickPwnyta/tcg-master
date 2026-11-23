import { Choice } from "../Choice.js";
import { InterruptSync } from "../Interrupt.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { MenuOption } from "../MenuOption.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.Attack)
export class InterruptWorker_Attack extends InterruptWorker {
    public override execute(context: InterruptContext, attack_name: string | MenuOption.Attack): boolean {
        const player = context.engine.game.activePlayer;
        const card = player.activePokemon!;

        const cantAttackReason = card.cantAttackReason();
        if (cantAttackReason) {
            context.engine.sendError(player, `${card.name} can't attack due to ${cantAttackReason}.`);
            return false;
        }

        if (attack_name !== MenuOption.Attack) {
            // Also check the opponent's attacks in case of Metronome
            const attack = card.def.attacks.find(a => a.name === attack_name) ?? context.engine.game.defendingPokemon.def.attacks.find(a => a.name === attack_name)!;

            const report = attack.canUse(context.engine);
            if (!report.accepted) {
                context.engine.sendError(player, report.reason ?? `${card.name} can't use ${attack_name} right now.`);
                return false;
            }

            for (const status of card.modifiers) {
                if (!status.modifier.canUseAttack({
                    engine: context.engine,
                    owner: player,
                    card: card
                }, attack_name, status.args)) {
                    context.engine.sendError(player, `${attack_name} is disabled.`);
                    return false;
                }
            }

            const interrupt = attack.validateTargets(context.engine);
            if (interrupt) {
                context.engine.interrupts.interrupt(interrupt);
                return true;
            }

            context.engine.game.attackResult = attack.execute(context.engine);
            return true;
        } else {
            context.engine.interrupts.interrupt(new InterruptSync(player)
                .withPrompt("Which attack will", card, "use?")
                .withChoices(card.def.attacks.map(a => new Choice(a).withPriority(100)))
                .withResolution(InterruptResolution.Attack));
            return true;
        }
    }
};
