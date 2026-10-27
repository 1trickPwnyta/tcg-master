import { InvalidSelectionError } from "../game/interaction/prompts/Prompt.js";
import { Command } from "./Command.js";
import { CommandContext } from "./CommandContext.js";

export class Command_select extends Command {
    public name: string = "select";

    public execute(context: CommandContext): any[] | void {
        const interrupt = context.game.getInterrupt(context.player_id);
        if (interrupt) {
            const num = parseInt(context.text);
            if (!isNaN(num) && num > 0 && num <= interrupt.choices.length) {
                context.game.resolveInterrupt(context.player_id, num - 1);
                return;
            } else if (context.text === "`") {
                context.game.resolveInterrupt(context.player_id, null);
                return;
            }

            context.client.send(new InvalidSelectionError().message);
        }
    }
}