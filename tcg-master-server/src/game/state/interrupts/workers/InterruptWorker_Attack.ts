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
                context.engine.sendError(context.engine.game.activePlayer, card, "doesn't have enough energy to use", attack.name, ".");
                return false;
            }
            for (let i = 0; i < (card.accuracyChecks ?? 0); i++) {
                if (!context.engine.game.flipCoin(player)) {
                    return this.failAttack(context, card, "'s attack failed.");
                }
            }
            return attack.execute({
                engine: context.engine,
                attack: attack,
                attacker: card,
                defender: context.engine.game.defendingPokemon!
            }, ...args);
        } else {
            context.engine.interrupts.interrupt({
                player: player.id,
                prompt: `Which attack will ${card.name} use?`,
                choices: card.def.attacks.map(a => ({ text: a.name, target_id: a.name })),
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
