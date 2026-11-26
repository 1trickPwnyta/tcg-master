import { ClientEventType } from "../../Client.js";
import { GameEngine } from "../engine/GameEngine.js";
import { Card } from "./Card.js";
import { Player } from "./Player.js";
import { ClientSerialize, Serializable, Serialize } from "./serializer.js";
import { State } from "./State.js";

@Serializable()
export class Location extends State {
    @Serialize()
    private readonly owner_id: number;

    @Serialize() @ClientSerialize()
    public readonly cards: Card[] = [];

    public readonly inPlay: boolean = false;
    private _owner?: Player;

    public constructor(id: number, engine: GameEngine, owner: Player) {
        super(id, engine);
        this.owner_id = owner.id;
    }

    public get owner(): Player {
        if (!this._owner) {
            this._owner = this.engine.game.getPlayer(this.owner_id);
        }
        return this._owner;
    }

    public get count(): number {
        return this.cards.length;
    }

    protected get clientTag(): string | number | undefined {
        return this.id === this.owner.active.id ? "active"
            : this.id === this.owner.bench.id ? "bench"
            : this.id === this.owner.deck.id ? "deck"
            : this.id === this.owner.discard.id ? "discard"
            : this.id === this.owner.prizes.id ? "prizes"
            : this.id === this.owner.hand.id ? "hand"
            : undefined;
    }

    public add(card: Card) {
        if (card.location != this) {
            card.notify_premove(card.location ?? null, this);
            if (card.location) {
                card.location.cards.splice(card.location.cards.indexOf(card), 1);
                card.location.notify_removed(card);
            }
            this.cards.push(card);
            const oldLocation = card.location;
            card.location = this;
            if (oldLocation) {
                this.engine.sendEvent({
                    type: ClientEventType.CardMove,
                    args: {
                        owner: this.owner_id,
                        mover: card,
                        from: oldLocation.clientTag,
                        to: this.clientTag
                    }
                });
            }
            card.notify_postmove(oldLocation ?? null, this);
        }
    }

    public notify_removed(card: Card) { }
};
