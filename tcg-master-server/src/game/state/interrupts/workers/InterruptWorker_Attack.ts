import { PokemonCardDef } from "../../../../defs/PokemonCardDef.js";
import { DefDatabase } from "../../../../defs/DefDatabase.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.Attack)
export class InterruptWorker_Attack extends InterruptWorker {
    public override execute(context: InterruptContext, attack_name: string, ...args: number[]): boolean {
        const player = context.game.players.active;
        const card = player.active.cards[0];
        if (card.orientation === "paralyzed") {
            context.game.sendError(player, card, "can't attack due to paralysis.");
            return false;
        }
        if (card.orientation === "asleep") {
            context.game.sendError(player, card, "can't attack due to sleep.");
            return false;
        }
        const def = DefDatabase.get<PokemonCardDef>(card.def);
        if (attack_name) {
            if (card.orientation === "confused") {
                context.game.send(player, "'s", card, "is confused.");
                if (!context.game.flipCoin(player.id)) {
                    context.game.pokemon.damage({ owner_id: player.id, card_id: card.id, amount: 20, source: "confusion", type: def.type });
                    return this.failAttack(context);
                }
            }
            for (let i = 0; i < (card.accuracyChecks ?? 0); i++) {
                if (!context.game.flipCoin(player.id)) {
                    return this.failAttack(context, card, "'s attack failed.");
                }
            }
            const attack = def.attacks.find(a => a.name === attack_name)!;
            return attack.execute({
                game: context.game,
                state: context.state,
                attacker: card,
                defender: context.game.players.inactive.active.cards[0]
            }, ...args);
        } else {
            context.game.interrupts.interrupt({
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
            context.game.send(...message);
        }
        context.state.turn!.attacked = true;
        return true;
    }
};
