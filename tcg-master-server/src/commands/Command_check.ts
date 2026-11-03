import { Client } from "../Client.js";
import { CardDatabase } from "../game/cards/CardDatabase.js";
import { CardWorker_Pokemon } from "../game/cards/workers/CardWorker_Pokemon.js";
import { CardState } from "../game/state/CardState.js";
import { LocationState } from "../game/state/LocationState.js";
import { IToken } from "../IToken.js";
import { Command, InvalidCommandArgumentsError } from "./Command.js";
import { CommandContext } from "./CommandContext.js";

export class Command_check extends Command {
    public readonly name: string = "check";

    private getStatus(card: CardState): IToken[] {
        const maxHp = CardDatabase.find<CardWorker_Pokemon>(card.dbid).hp;
        return Client.tokenize(
            card,
            { name: `[${maxHp - card.damage} / ${maxHp} HP]`, type: "hp" },
            `[${card.orientation}]`,
            ...(card.poison ? [ "[🤢]" ] : []),
            "<br />...Energy:",
            ...Client.getCardList(card.attachments.cards.filter(c => c.kind === "energy"))
        );
    }

    private getBenchList(bench: LocationState): IToken[] {
        if (!bench.cards.length) {
            return [ { name: "(empty)" } ];
        }
        let tokens: IToken[] = [];
        for (let i = 0; i < bench.cards.length; i++) {
            tokens = [ ...tokens, ...this.getStatus(bench.cards[i]) ];
            if (i < bench.cards.length - 1) {
                tokens.push({ name: "<br />" });
            }
        }
        return tokens;
    }

    public execute(context: CommandContext): any[] | void {
        const area = context.args[0];
        const state = context.game.getState();
        const player = state.players.find(p => p.id ===context.player_id)!;
        const opponent = state.players.find(p => p.id !== context.player_id)!;
        switch (area) {
            case "deck": return [ player.deck.cards.length, "card(s)" ];
            case "hand": return Client.getCardList(player.hand.cards);
            case "discard": return Client.getCardList(player.discard.cards);
            case "prizes": return [ player.prizes.cards.length, "card(s)" ];
            case "active": return player.active.cards.length ? this.getStatus(player.active.cards[0]) : [ "(none)" ];
            case "bench": return this.getBenchList(player.bench);
            case "xdeck": return [ opponent.deck.cards.length, "card(s)" ];
            case "xhand": return [ opponent.hand.cards.length, "card(s)" ];
            case "xdiscard": return Client.getCardList(opponent.discard.cards);
            case "xprizes": return [ opponent.prizes.cards.length, "card(s)" ];
            case "xactive": return state.turn ? (opponent.active.cards.length ? this.getStatus(opponent.active.cards[0]) : [ "(none)" ]) : [ "(hidden)" ];
            case "xbench": return state.turn ? this.getBenchList(opponent.bench) : [ "(hidden)" ];
        }

        const cardName = context.text;
        const card = CardDatabase.search({ name: cardName });
        if (card) {
            return card.getDetails();
        }

        throw new InvalidCommandArgumentsError(context.name, context.args);
    }
};
