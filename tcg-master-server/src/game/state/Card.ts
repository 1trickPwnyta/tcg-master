import { CardDef } from "../../defs/CardDef.js";
import { DefDatabase } from "../../defs/DefDatabase.js";
import { IToken } from "../../IToken.js";
import { GameEngine } from "../engine/GameEngine.js";
import { ITargetable } from "./interrupts/Choice.js";
import { Location } from "./Location.js";
import { Player } from "./Player.js";
import { ClientSerialize, ClientSerializeProxy, Serializable, Serialize } from "./serializer.js";
import { State } from "./State.js";

@Serializable()
export abstract class Card extends State implements ITargetable {
    @Serialize()
    public readonly def_name: string;

    @Serialize()
    public readonly owner_id: number;

    @Serialize()
    private location_id?: number;

    @ClientSerialize()
    public name: string;

    @ClientSerialize()
    private graphicPath: string;

    private _def?: CardDef;
    private _owner?: Player;
    private _location?: Location;

    public get token(): IToken {
        return this.def.token;
    }

    public get targetName(): IToken[] {
        return [ this.token ];
    }

    public get def(): CardDef {
        if (!this._def) {
            this._def = DefDatabase.get<CardDef>(this.def_name);
        }
        return this._def;
    }

    public get owner(): Player {
        if (!this._owner) {
            this._owner = this.engine.game.getPlayer(this.owner_id);
        }
        return this._owner;
    }

    public get location(): Location | undefined {
        if (!this._location) {
            this._location = this.location_id ? this.engine.search.getLocation(this.location_id) : undefined;
        }
        return this._location;
    }

    public set location(location: Location) {
        this.location_id = location.id;
        this._location = location;
    }

    public get hasher(): any {
        return [ this.def_name ];
    }

    public constructor(id: number, engine: GameEngine, def: CardDef, owner: Player) {
        super(id, engine);
        this.def_name = def.name;
        this.owner_id = owner.id;
        this.name = def.label;
        this.graphicPath = def.graphicPath;
    }

    public abstract play(...targets: number[]): boolean;

    public discard() {
        this.owner.discard.add(this);
    }

    public notify_premove(oldLocation: Location | null, newLocation: Location) { }

    public notify_postmove(oldLocation: Location | null, newLocation: Location) { }
};
