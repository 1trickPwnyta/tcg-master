import { Command } from "./Command.js";
import { CommandContext } from "./CommandContext.js";

export class Command_select extends Command {
    public name: string = "select";

    public execute(context: CommandContext): string | void {
        const selection: number = parseInt(context.text);
        if (selection > 0) {
            if (context.player.prompt?.respond(selection - 1)) {
                return;
            }
        }
        
        context.player.error("Enter a valid selection.");
    }
}