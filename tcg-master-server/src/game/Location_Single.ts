import { Card } from "./cards/Card.js";
import { Location } from "./Location.js";

export class Location_Single<T extends Card> extends Location<T> {
    public get single(): T | null {
        return this.cards.length ? this.cards[0] : null;
    }

    public set single(card: T) {
        this.cards.forEach(c => c.take());
        this.add(card);
    }

    public takeSingle(): Card | null {
        return this.single ? super.take(this.single) : null;
    }
};
