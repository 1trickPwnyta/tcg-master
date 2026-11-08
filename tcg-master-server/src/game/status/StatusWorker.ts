import { StatusDef } from "../../defs/StatusDef.js";
import { AttackContext } from "../attacks/AttackWorker.js";
import { GameEngine } from "../engine/GameEngine.js";
import { GameState } from "../state/GameState.js";

export type StatusContext = {
    engine: GameEngine;
    owner_id: number;
    card_id: number;
};

export abstract class StatusWorker {
    private def: StatusDef;

    public constructor(def: StatusDef, args: any) {
        this.def = def;
    }

    public give(context: StatusContext) {
        const card = context.engine.search.getCard(context.card_id)!;
        card.status.push(this.def.name);
        if (this.def.orientation) {
            card.orientation = this.def.orientation;
        }
        this.notify_given(context);
    }

    protected notify_given(context: StatusContext) { }

    public try_attack(context: StatusContext, attackContext: AttackContext): boolean {
        return true;
    }

    public try_retreat(context: StatusContext): boolean {
        return true;
    }

    public notify_knockedOut(context: StatusContext, attacker_id?: number) { }

    public notify_endOfTurn(context: StatusContext, turn_id: number) { }

    protected remove(context: StatusContext) {
        const card = context.engine.search.getCard(context.card_id);
        if (card) {
            card.status = card.status.filter(s => s !== this.def.label);
            if (this.def.orientation) {
                card.orientation = "normal";
            }
        }
    }
};
