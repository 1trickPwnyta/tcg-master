import { Card } from "../game/cards/Card.js";
import { GameState } from "../game/Game.js";
import { Command, InvalidCommandArgumentsError } from "./Command.js";
import { CommandContext } from "./CommandContext.js";

export class Command_check extends Command {
    public readonly name: string = "check";

    public execute(context: CommandContext): any[] | void {
        const area = context.args[0];
        switch (area) {
            case "deck": return [ context.player.deck.count, "card(s)" ];
            case "hand": return [ context.player.hand ];
            case "discard": return [ context.player.discard ];
            case "prizes": return [ context.player.prizes.count, "card(s)" ];
            case "active": return context.player.active.single?.getStatus() ?? [ "(none)" ];
            case "bench": return [ context.player.bench ];
            case "xdeck": return [ context.player.opponent.deck.count, "card(s)" ];
            case "xhand": return [ context.player.opponent.hand.count, "card(s)" ];
            case "xdiscard": return [ context.player.opponent.discard ];
            case "xprizes": return [ context.player.opponent.prizes.count, "card(s)" ];
            case "xactive": return context.game.state != GameState.Setup ? (context.player.opponent.active.single?.getStatus() ?? [ "(none)" ]) : [ "(hidden)" ];
            case "xbench": return context.game.state != GameState.Setup ? [ context.player.opponent.bench ] : [ "(hidden)" ];
        }

        const cardName = context.text;
        const card = Card.all.find(c => c.name === cardName);
        if (card) {
            return card.getDetails();
        }

        throw new InvalidCommandArgumentsError(context.name, context.args);
    }
};
