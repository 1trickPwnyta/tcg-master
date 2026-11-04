import { CardDatabase } from "../../cards/CardDatabase.js";
import { CardWorker_Pokemon } from "../../cards/workers/CardWorker_Pokemon.js";
import { InterruptResolution } from "../interrupts/InterruptResolution.js";
import { ResolvesInterrupt } from "../interrupts/InterruptResolver.js";
import { StateContext, StateWorker } from "./StateWorker.js";

@ResolvesInterrupt(InterruptResolution.AttackTargets)
export class StateWorker_AttackTargets extends StateWorker {
    public override execute(context: StateContext, target_id: number, attack_id: string): boolean {
        const player = context.game.players.active;
        const card = player.active.cards[0];
        const worker = CardDatabase.find<CardWorker_Pokemon>(card.dbid);
        const attack = worker.attacks.find(a => a.dbid === attack_id)!;
        return attack.execute({ game: context.game, state: context.state, attacker: card, defender: context.game.players.inactive.active.cards[0] }, target_id);
    }
};
