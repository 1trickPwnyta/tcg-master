import { StatusDefOf } from "../../defs/defof/StatusDefOf.js";
import { PokemonCardDef } from "../../defs/PokemonCardDef.js";
import { StatusDef } from "../../defs/StatusDef.js";
import { IToken } from "../../IToken.js";
import { GameEngine } from "../engine/GameEngine.js";
import { Card } from "./Card.js";
import { Location } from "./Location.js";
import { PokemonCard } from "./PokemonCard.js";
import { Serializable, Serialize } from "./serializer.js";

@Serializable()
export class PokemonCardWrapper extends PokemonCard {
    private static nextId: number = 1000000000;

    @Serialize()
    public readonly wrapped: Card;

    public override get token(): IToken {
        return this.wrapped.token;
    }

    public constructor(engine: GameEngine, def: PokemonCardDef, wrapped: Card) {
        super(PokemonCardWrapper.nextId++, engine, def, wrapped.owner);
        this.wrapped = wrapped;
    }

    public override notify_postmove(_oldLocation: Location, newLocation: Location): void {
        if (!this.inPlay) {
            newLocation.add(this.wrapped);
            newLocation.cards.splice(newLocation.cards.indexOf(this), 1);
        }
        this.wrapped.location = newLocation;
    }

    public override cantAttackReason(): string | null {
        return "its rules";
    }

    public override cantRetreatReason(): string | null {
        return "its rules";
    }

    public override giveStatus(def: StatusDef, args?: any): void {
        if ([ StatusDefOf.Sleep, StatusDefOf.Confusion, StatusDefOf.Paralysis, StatusDefOf.Poison ].includes(def)) {
            this.engine.send(this, "cannot be Asleep, Confused, Paralyzed, or Poisoned.")
            return;
        }

        super.giveStatus(def, args);
    }
};
