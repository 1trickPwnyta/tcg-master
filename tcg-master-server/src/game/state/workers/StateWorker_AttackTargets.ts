import { CardDef_Pokemon } from "../../../defs/CardDef_Pokemon.js";
import { DefDatabase } from "../../../defs/DefDatabase.js";
import { InterruptResolution } from "../interrupts/InterruptResolution.js";
import { ResolvesInterrupt } from "../interrupts/InterruptResolver.js";
import { StateContext, StateWorker } from "./StateWorker.js";

@ResolvesInterrupt(InterruptResolution.AttackTargets)
export class StateWorker_AttackTargets extends StateWorker {
    public override execute(context: StateContext, target_id: number, attack_id: string): boolean {
        const player = context.game.players.active;
        const card = player.active.cards[0];
        const worker = DefDatabase.get<CardDef_Pokemon>(card.def);
        const attack = worker.attacks.find(a => a.name === attack_id)!;
        return attack.execute({
            game: context.game,
            state: context.state,
            attacker: card,
            defender: context.game.players.inactive.active.cards[0]
        }, target_id);
    }
};
