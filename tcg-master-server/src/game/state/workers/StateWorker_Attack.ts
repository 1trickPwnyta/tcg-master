import { CardDatabase } from "../../cards/CardDatabase.js";
import { CardWorker_Pokemon } from "../../cards/CardWorker_Pokemon.js";
import { InterruptResolution } from "../../InterruptResolution.js";
import { ResolvesInterrupt } from "../../InterruptResolver.js";
import { StateContext, StateWorker } from "./StateWorker.js";

@ResolvesInterrupt(InterruptResolution.Attack)
export class StateWorker_Attack extends StateWorker {
    public override execute(context: StateContext, attack_id: string): boolean {
        const player = context.game.activePlayer;
        const card = player.active.cards[0];
        const worker = CardDatabase.find<CardWorker_Pokemon>(card.dbid);
        if (attack_id) {
            const attack = worker.attacks.find(a => a.dbid === attack_id)!;
            return attack.execute({ game: context.game, state: context.state, attacker: card, defender: context.game.inactivePlayer.active.cards[0] });
        } else {
            context.game.interrupt({
                player: player.id,
                prompt: `Which attack will ${card.name} use?`,
                choices: worker.attacks.map(a => ({ text: a.name, target_id: a.dbid })),
                resolution: InterruptResolution.Attack
            });
            return true;
        }
    }
};
