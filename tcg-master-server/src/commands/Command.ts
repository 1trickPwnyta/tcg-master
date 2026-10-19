import { CommandContext } from "./CommandContext.js";

export abstract class Command {
    public abstract readonly name: string;

    private static readonly commands: Map<string, Command> = new Map<string, Command>();

    public static register(command: Command) {
        Command.commands.set(command.name, command);
    }

    public static execute(context: CommandContext): string | void {
        const command = Command.commands.get(context.name);
        if (!command) {
            throw new CommandNotFoundError(context.name);
        }
        try {
            return command.execute(context);
        } catch (e) {
            if (e instanceof InvalidCommandArgumentsError) {
                console.log(e.message);
                context.player.error(e.message);
            } else {
                throw e;
            }
        }
    }

    public abstract execute(context: CommandContext): string | void;
};

export class InvalidCommandArgumentsError extends Error {
    public constructor(command: string, args: string[]) {
        super(`Command arguments invalid for ${command}: ${args.join(" ")}`);
    }
}

export class CommandNotFoundError extends Error {
    public constructor(command: string) {
        super(`Command not found: ${command}`);
    }
};
