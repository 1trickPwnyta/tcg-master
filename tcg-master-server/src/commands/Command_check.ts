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
            case "active": return context.player.active.single?.toString() ?? "(none)";
            case "bench": return context.player.bench.toString();
            case "xdeck": return `${context.player.opponent.deck.count} card(s)`;
            case "xhand": return `${context.player.opponent.hand.count} card(s)`;
            case "xdiscard": return context.player.opponent.discard.toString();
            case "xprizes": return `${context.player.opponent.prizes.count} card(s)`;
            case "xactive": return context.player.opponent.active.single?.toString() ?? "(none)";
            case "xbench": return context.player.opponent.bench.toString();
            default: throw new InvalidCommandArgumentsError(context.name, context.args);
        }
    }
};
