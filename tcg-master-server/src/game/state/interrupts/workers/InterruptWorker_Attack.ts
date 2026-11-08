import { PokemonCardDef } from "../../../../defs/PokemonCardDef.js";
import { DefDatabase } from "../../../../defs/DefDatabase.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.Attack)
export class InterruptWorker_Attack extends InterruptWorker {
    public override execute(context: InterruptContext, attack_name: string, ...args: number[]): boolean {
        const player = context.engine.players.active;
        const card = player.active.cards[0];
        const cantAttackReason = context.engine.pokemon.cantAttack(card.id);
        if (cantAttackReason) {
            context.engine.sendError(player, card, "can't attack due to", cantAttackReason, ".");
            return false;
        }
        const def = DefDatabase.get<PokemonCardDef>(card.def);
        if (attack_name) {
            const attack = def.attacks.find(a => a.name === attack_name)!;
            if (!attack.costSatisfied(context.engine.pokemon.getEnergy(card.id).map(e => e.def))) {
                context.engine.sendError(context.engine.players.active, card, "doesn't have enough energy to use", attack.name, ".");
                return false;
            }
            for (let i = 0; i < (card.accuracyChecks ?? 0); i++) {
                if (!context.engine.flipCoin(player.id)) {
                    return this.failAttack(context, card, "'s attack failed.");
                }
            }
            return attack.execute({
                engine: context.engine,
                attack: attack,
                attacker: card,
                defender: context.engine.players.inactive.active.cards[0]
            }, ...args);
        } else {
            context.engine.interrupts.interrupt({
                player: player.id,
                prompt: `Which attack will ${card.name} use?`,
                choices: def.attacks.map(a => ({ text: a.name, target_id: a.name })),
                resolution: InterruptResolution.Attack
            });
            return true;
        }
    }

    private failAttack(context: InterruptContext, ...message: any[]): boolean {
        if (message.length) {
            context.engine.send(...message);
        }
        context.engine.state.turn!.attacked = true;
        return true;
    }
};
