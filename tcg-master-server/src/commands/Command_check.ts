import { Command, InvalidCommandArgumentsError } from "./Command.js";
import { CommandContext } from "./CommandContext.js";

export class Command_check extends Command {
    public readonly name: string = "check";

    public execute(context: CommandContext): string | void {
        const area = context.args[0];
        switch (area) {
            case "deck": return `${context.player.deck.count} card(s)`;
            case "hand": return context.player.hand.toString();
            case "discard": return context.player.discard.toString();
            case "prizes": return `${context.player.prizes.count} card(s)`;
            case "active": return context.player.active?.toString() ?? "(none)";
            default: throw new InvalidCommandArgumentsError(context.name, context.args);
        }
    }
};
