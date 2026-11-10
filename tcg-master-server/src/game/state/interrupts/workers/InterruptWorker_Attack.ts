import { Choice } from "../../Choice.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.Attack)
export class InterruptWorker_Attack extends InterruptWorker {
    public override execute(context: InterruptContext, attack_name: string, ...args: number[]): boolean {
        const player = context.engine.game.activePlayer;
        const card = player.activePokemon!;
        const cantAttackReason = card.cantAttackReason();
        if (cantAttackReason) {
            context.engine.sendError(player, card, "can't attack due to", cantAttackReason, ".");
            return false;
        }
        if (attack_name) {
            const attack = card.def.attacks.find(a => a.name === attack_name)!;
            if (!attack.costSatisfied(card.energy)) {
                context.engine.sendError(player, card, "doesn't have enough energy to use", attack.name, ".");
                return false;
            }
            const attackContext = {
                engine: context.engine,
                attack: attack,
                attacker: card,
                defender: context.engine.game.defendingPokemon!
            };
            if (!attack.canUse(attackContext)) {
                context.engine.sendError(player, card, "can't use", attack, "right now.");
                return false;
            }
            for (const status of card.status) {
                if (!status.def.worker.canUseAttack({
                    engine: context.engine,
                    owner: player,
                    card: card
                }, attack_name, status.args)) {
                    context.engine.sendError(player, attack_name, "is disabled.");
                    return false;
                }
            }
            return attack.execute(attackContext, ...args);
        } else {
            context.engine.interrupts.interrupt({
                player: player.id,
                prompt: `Which attack will ${card.name} use?`,
                choices: card.def.attacks.map(a => new Choice(a)),
                resolution: InterruptResolution.Attack
            });
            return true;
        }
    }

    private failAttack(context: InterruptContext, ...message: any[]): boolean {
        if (message.length) {
            context.engine.send(...message);
        }
        context.engine.game.turn!.attacked = true;
        return true;
    }
};
