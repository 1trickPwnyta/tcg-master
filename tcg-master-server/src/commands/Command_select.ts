import { InvalidSelectionError } from "../game/interaction/prompts/Prompt.js";
import { Command } from "./Command.js";
import { CommandContext } from "./CommandContext.js";

export class Command_select extends Command {
    public name: string = "select";

    public execute(context: CommandContext): any[] | void {
        const request = context.game.moves.getRequestedMove();
        if (request) {
            const target = request.choices.find(c => c.key == context.text)?.target;
            if (target) {
                const move = new request.type(context.player, target);
                context.game.moves.makeMove(move);
            } else {
                context.player.send(new InvalidSelectionError());
            }
        } else {
            context.player.send("Please wait.");
        }
    }
}