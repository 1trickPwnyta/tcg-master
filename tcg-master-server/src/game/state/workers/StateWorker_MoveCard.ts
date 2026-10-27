import { GameState } from "../GameState.js";
import { StateWorker } from "./StateWorker.js";

export class StateWorker_MoveCard extends StateWorker {
    public override execute(state: GameState, card_id: string, from_id: string, to_id: string) {
        const from = StateWorker.getLocation(state, from_id);
        const to = StateWorker.getLocation(state, to_id);
        if (from && to) {
            const card = from.cards.find(c => c.id === card_id);
            if (card) {
                from.cards.splice(from.cards.indexOf(card), 1);
                to.cards.push(card);
            }
        } else {
            throw new Error("One or both locations could not be found.");
        }
    }
}