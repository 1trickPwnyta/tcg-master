import { AIEvaluator } from "../ai/AIEvaluator.js";
import { Command, InvalidCommandArgumentsError } from "./Command.js";
import { CommandContext } from "./CommandContext.js";

export class Command_debug extends Command {
    public readonly name: string = "debug";

    public execute(context: CommandContext): any[] | void {
        const subcommand = context.args[0];
        const state = context.engine.game;
        const player = state.players.find(p => p.id === context.player_id)!;
        const opponent = state.players.find(p => p.id !== context.player_id)!;
        switch (subcommand) {
            case "score": return [ AIEvaluator.evaluate(context.engine, player.id) ];
            case "xscore": return [ AIEvaluator.evaluate(context.engine, opponent.id) ];
        }

        throw new InvalidCommandArgumentsError(context.name, context.args);
    }
};
