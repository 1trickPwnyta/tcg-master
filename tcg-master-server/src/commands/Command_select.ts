import { InterruptActor } from "../game/state/actors/InterruptActor.js";
import { Command } from "./Command.js";
import { CommandContext } from "./CommandContext.js";

export class Command_select extends Command {
    public name: string = "select";

    public execute(context: CommandContext): any[] | void {
        const state = context.game.getState();
        const interrupt = InterruptActor.getInterrupt(state, context.player_id);
        if (interrupt) {
            const num = parseInt(context.text);
            if (!isNaN(num) && num > 0 && num <= interrupt.choices.length) {
                InterruptActor.resolveInterrupt(context.game, state, context.player_id, num - 1);
                return;
            } else if (context.text === "`") {
                InterruptActor.resolveInterrupt(context.game, state, context.player_id, null);
                return;
            }

            context.client.error("Invalid selection.");
        }
    }
}