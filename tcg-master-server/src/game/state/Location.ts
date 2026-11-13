import { GameEngine } from "../engine/GameEngine.js";
import { Card } from "./Card.js";
import { Player } from "./Player.js";
import { PokemonCard } from "./PokemonCard.js";
import { Serializable, Serialize } from "./serializer.js";
import { State } from "./State.js";

@Serializable()
export class Location extends State {
    @Serialize()
    private readonly owner_id: number;

    @Serialize()
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

    public add(card: Card) {
        if (card.location != this) {
            card.notify_moved(card.location ?? null, this);
            if (card.location) {
                card.location.cards.splice(card.location.cards.indexOf(card), 1);
                card.location.notify_removed(card);
            }
            this.cards.push(card);
            card.location = this;
        }
    }

    public notify_removed(card: Card) { }
};
