import { GameState } from "../GameState.js";
import { LocationState } from "../LocationState.js";

export abstract class StateWorker {
    public static getLocation(state: GameState, location_id: string): LocationState | null {
        for (const player of state.players) {
            for (const location of [ player.active, player.bench, player.deck, player.discard, player.hand, player.prizes ]) {
                if (location.id === location_id) {
                    return location;
                }
            }
            for (const card of [ ...player.active.cards, ...player.bench.cards ]) {
                if (card.attachments.id === location_id) {
                    return card.attachments;
                }
            }
        }
        return null;
    }

    public abstract execute(state: GameState, ...args: string[]): void;
};
