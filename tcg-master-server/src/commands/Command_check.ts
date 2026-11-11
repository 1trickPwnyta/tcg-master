import { Client } from "../Client.js";
import { DefDatabase } from "../defs/DefDatabase.js";
import { IToken } from "../IToken.js";
import { Command, InvalidCommandArgumentsError } from "./Command.js";
import { CommandContext } from "./CommandContext.js";
import { PokemonCard } from "../game/state/PokemonCard.js";
import { Bench } from "../game/state/Bench.js";
import { CardDef } from "../defs/CardDef.js";
import { StatusDefOf } from "../defs/defof/StatusDefOf.js";
import { ModifierStatus } from "../game/modifiers/ModifierStatus.js";

export class Command_check extends Command {
    public readonly name: string = "check";

    private getStatus(card: PokemonCard): IToken[] {
        const maxHp = card.def.hp;
        return Client.tokenize(
            card,
            { name: `[${maxHp - card.damage} / ${maxHp} HP]`, type: "hp" },
            `[${card.orientation}]`,
            ...(card.modifiers.some(s => s instanceof ModifierStatus && s.def == StatusDefOf.Poison) ? [ "[🤢]" ] : []),
            "<br />...Energy:",
            ...Client.getCardList(card.attachments.cards.filter(c => c.def.kind === "energy"))
        );
    }

    private getBenchList(bench: Bench): IToken[] {
        if (!bench.count) {
            return [ { name: "(empty)" } ];
        }
        let tokens: IToken[] = [];
        for (let i = 0; i < bench.count; i++) {
            tokens = [ ...tokens, ...this.getStatus(bench.cards[i]) ];
            if (i < bench.count - 1) {
                tokens.push({ name: "<br />" });
            }
        }
        return tokens;
    }

    public execute(context: CommandContext): any[] | void {
        const area = context.args[0];
        const state = context.engine.game;
        const player = state.players.find(p => p.id ===context.player_id)!;
        const opponent = state.players.find(p => p.id !== context.player_id)!;
        switch (area) {
            case "deck": return [ player.deck.count, "card(s)" ];
            case "hand": return Client.getCardList(player.hand.cards);
            case "discard": return Client.getCardList(player.discard.cards);
            case "prizes": return [ player.prizes.count, "card(s)" ];
            case "active": return player.activePokemon ? this.getStatus(player.activePokemon) : [ "(none)" ];
            case "bench": return this.getBenchList(player.bench);
            case "xdeck": return [ opponent.deck.count, "card(s)" ];
            case "xhand": return [ opponent.hand.count, "card(s)" ];
            case "xdiscard": return Client.getCardList(opponent.discard.cards);
            case "xprizes": return [ opponent.prizes.count, "card(s)" ];
            case "xactive": return state.turn ? (opponent.activePokemon ? this.getStatus(opponent.activePokemon) : [ "(none)" ]) : [ "(hidden)" ];
            case "xbench": return state.turn ? this.getBenchList(opponent.bench) : [ "(hidden)" ];
        }
        
        const def = DefDatabase.get<CardDef>(context.text);
        if (def) {
            return def.getDetails();
        }

        throw new InvalidCommandArgumentsError(context.name, context.args);
    }
};
