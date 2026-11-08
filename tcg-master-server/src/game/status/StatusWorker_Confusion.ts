import { DefDatabase } from "../../defs/DefDatabase.js";
import { PokemonCardDef } from "../../defs/PokemonCardDef.js";
import { StatusDef } from "../../defs/StatusDef.js";
import { StatusContext, StatusWorker } from "./StatusWorker.js";

export class StatusWorker_Confusion extends StatusWorker {
    protected override notify_given(context: StatusContext): void {
        const owner = context.engine.players.get(context.owner_id);
        const card = context.engine.search.getCard(context.card_id);
        context.engine.send(owner, "'s", card, "got confused!");
    }

    public override try_attack(context: StatusContext): boolean {
        const owner = context.engine.players.get(context.owner_id);
        const card = context.engine.search.getCard(context.card_id)!;
        context.engine.send(owner, "'s", card, "is confused.");
        if (context.engine.flipCoin(context.owner_id)) {
            return true;
        } else {
            context.engine.pokemon.damage({
                owner_id: context.owner_id,
                card_id: context.card_id,
                amount: 20,
                attacker_id: context.card_id,
                type: DefDatabase.get<PokemonCardDef>(card.def).type,
                source: "confusion"
            })
            return false;
        }
    }

    public override try_retreat(context: StatusContext): boolean {
        const owner = context.engine.players.get(context.owner_id);
        const card = context.engine.search.getCard(context.card_id)!;
        context.engine.send(owner, "'s", card, "is confused.");
        if (context.engine.flipCoin(context.owner_id)) {
            return true;
        } else {
            context.engine.send(owner, "'s", card, "couldn't retreat.");
            context.engine.pokemon.giveStatus(context.owner_id, context.card_id, DefDatabase.get<StatusDef>("FailedRetreat"));
            return false;
        }
    }
};
