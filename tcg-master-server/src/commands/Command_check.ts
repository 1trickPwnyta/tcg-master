import { Card } from "../game/cards/Card.js";
import { CardDatabase } from "../game/cards/CardDatabase.js";
import { CardWorker_Pokemon } from "../game/cards/CardWorker_Pokemon.js";
import { CardState } from "../game/state/CardState.js";
import { IToken, Token } from "../Token.js";
import { Command, InvalidCommandArgumentsError } from "./Command.js";
import { CommandContext } from "./CommandContext.js";

export class Command_check extends Command {
    public readonly name: string = "check";

    private getCardList(cards: CardState[]): IToken[] {
        return cards.length ? cards.flatMap(c => [ "[", new Token(c.name, c.tokenType), "]" ]) : [ "(empty)" ];
    }

    private getStatus(card: CardState): IToken[] {
        const maxHp = CardDatabase.find<CardWorker_Pokemon>(card.dbid).hp;
        return [
            card,
            new Token(`[${maxHp - card.damage} / ${maxHp} HP]`, "hp"),
            `[${card.orientation}]`,
            ...(card.poison ? [ "[🤢]" ] : []),
            "<br />...Energy:",
            ...this.getCardList(card.attachments.cards)
        ];
    }

    public execute(context: CommandContext): any[] | void {
        const area = context.args[0];
        const player = context.game.getPlayer(context.player_id);
        switch (area) {
            case "deck": return [ player.deck.cards.length, "card(s)" ];
            case "hand": return this.getCardList(player.hand.cards);
            case "discard": return this.getCardList(player.discard.cards);
            case "prizes": return [ player.prizes.cards.length, "card(s)" ];
            case "active": return player.active.cards.length ? this.getStatus(player.active.cards[0]) : [ "(none)" ];
            case "bench": return this.getCardList(player.bench.cards);
            case "xdeck": return [ player.opponent.deck.count, "card(s)" ];
            case "xhand": return [ player.opponent.hand.count, "card(s)" ];
            case "xdiscard": return [ player.opponent.discard ];
            case "xprizes": return [ player.opponent.prizes.count, "card(s)" ];
            case "xactive": return context.game.started ? (player.opponent.active.single?.getStatus() ?? [ "(none)" ]) : [ "(hidden)" ];
            case "xbench": return context.game.started ? [ player.opponent.bench ] : [ "(hidden)" ];
        }

        const cardName = context.text;
        const card = Card.all.find(c => c.name === cardName);
        if (card) {
            return card.getDetails();
        }

        throw new InvalidCommandArgumentsError(context.name, context.args);
    }
};
