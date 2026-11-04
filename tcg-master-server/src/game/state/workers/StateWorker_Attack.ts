import { CardDatabase } from "../../cards/CardDatabase.js";
import { CardWorker_Pokemon } from "../../cards/workers/CardWorker_Pokemon.js";
import { InterruptResolution } from "../interrupts/InterruptResolution.js";
import { ResolvesInterrupt } from "../interrupts/InterruptResolver.js";
import { StateContext, StateWorker } from "./StateWorker.js";

@ResolvesInterrupt(InterruptResolution.Attack)
export class StateWorker_Attack extends StateWorker {
    public override execute(context: StateContext, attack_id: string, ...args: number[]): boolean {
        const player = context.game.players.active;
        const card = player.active.cards[0];
        if (card.orientation === "paralyzed") {
            context.game.sendError(player, card, "can't attack due to paralysis.");
            return false;
        }
        const worker = CardDatabase.find<CardWorker_Pokemon>(card.dbid);
        if (attack_id) {
            if (card.orientation === "confused") {
                context.game.send(player, "'s", card, "is confused.");
                if (!context.game.flipCoin(player.id)) {
                    context.game.pokemon.damage({ owner_id: player.id, card_id: card.id, amount: 20, source: "confusion", type: worker.type });
                    return this.failAttack(context);
                }
            }
            for (let i = 0; i < (card.accuracyChecks ?? 0); i++) {
                if (!context.game.flipCoin(player.id)) {
                    return this.failAttack(context, card, "'s attack failed.");
                }
            }
            const attack = worker.attacks.find(a => a.dbid === attack_id)!;
            return attack.execute({
                game: context.game,
                state: context.state,
                attacker: card,
                defender: context.game.players.inactive.active.cards[0],
                attack: attack
            }, ...args);
        } else {
            context.game.interrupts.interrupt({
                player: player.id,
                prompt: `Which attack will ${card.name} use?`,
                choices: worker.attacks.map(a => ({ text: a.name, target_id: a.dbid })),
                resolution: InterruptResolution.Attack
            });
            return true;
        }
    }

    private failAttack(context: StateContext, ...message: any[]): boolean {
        if (message.length) {
            context.game.send(...message);
        }
        context.state.turn!.attacked = true;
        return true;
    }
};
