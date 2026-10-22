import { InvalidSelectionError } from "../game/interaction/prompts/Prompt.js";
import { Command } from "./Command.js";
import { CommandContext } from "./CommandContext.js";

export class Command_select extends Command {
    public name: string = "select";

    public execute(context: CommandContext): any[] | void {
        try {
            context.player.prompt?.respond(context.text);
        } catch (e) {
            if (e instanceof InvalidSelectionError) {
                context.player.send(e);
            } else {
                throw e;
            }
        }
    }
}