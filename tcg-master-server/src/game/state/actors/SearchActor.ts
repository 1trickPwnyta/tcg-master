import { CardState } from "../CardState.js";
import { LocationState } from "../LocationState.js";
import { StateActor } from "./StateActor.js";

export class SearchActor extends StateActor {
    private cards: Map<number, CardState> = new Map<number, CardState>();
    private locations: Map<number, LocationState> = new Map<number, LocationState>();
    private cardLocations: Map<number, LocationState> = new Map<number, LocationState>();

    public getCard(card_id: number, root?: LocationState): CardState | null {
        if (!root) {
            if (this.cards.has(card_id)) {
                return this.cards.get(card_id)!;
            }
            for (const player of this.state.players) {
                for (const location of [ player.active, player.bench, player.limbo, player.hand, player.discard, player.prizes, player.deck ]) {
                    const card = this.getCard(card_id, location);
                    if (card) {
                        return card;
                    }
                }
            }
        } else {
            for (const card of root.cards) {
                if (card.id === card_id) {
                    this.cards.set(card.id, card);
                    return card;
                } else {
                    const sub = this.getCard(card_id, card.attachments);
                    if (sub) {
                        return sub;
                    }
                }
            }
        }

        return null;
    }

    public findCard(card_id: number, root?: LocationState): LocationState | null {
        if (!root) {
            if (this.cardLocations.has(card_id)) {
                const location = this.cardLocations.get(card_id)!;
                const card = location.cards.find(c => c.id === card_id);
                if (card) {
                    return location;
                } else {
                    this.cardLocations.delete(card_id);
                }
            }
            for (const player of this.state.players) {
                for (const location of [ player.active, player.bench, player.limbo, player.hand, player.discard, player.prizes, player.deck ]) {
                    const sub = this.findCard(card_id, location);
                    if (sub) {
                        return sub;
                    }
                }
            }
        } else {
            for (const card of root.cards) {
                if (card.id === card_id) {
                    this.cardLocations.set(card.id, root);
                    return root;
                } else {
                    const sub = this.findCard(card_id, card.attachments);
                    if (sub) {
                        return sub;
                    }
                }
            }
        }

        return null;
    }

    public getLocation(location_id: number): LocationState | null {
        if (this.locations.has(location_id)) {
            return this.locations.get(location_id)!;
        }
        for (const player of this.state.players) {
            for (const location of [ player.active, player.bench, player.limbo, player.deck, player.discard, player.hand, player.prizes ]) {
                if (location.id === location_id) {
                    this.locations.set(location.id, location);
                    return location;
                }
            }
            for (const card of [ ...player.active.cards, ...player.bench.cards ]) {
                if (card.attachments.id === location_id) {
                    this.locations.set(card.attachments.id, card.attachments);
                    return card.attachments;
                }
            }
        }
        return null;
    }
};
