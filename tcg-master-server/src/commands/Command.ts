import { CommandContext } from "./CommandContext.js";

export abstract class Command {
    private static readonly commands: Map<string, Command> = new Map<string, Command>();
    public static default: Command | undefined;

    public static register(command: Command) {
        Command.commands.set(command.name, command);
    }

    public static execute(context: CommandContext): any[] | void {
        let command = Command.commands.get(context.name);
        if (!command) {
            if (Command.default) {
                context.args = [ context.name, ...context.args ];
                context.name = Command.default.name;
                command = Command.default;
            } else {
                throw new CommandNotFoundError(context.name);
            }
        }
        try {
            return command.execute(context);
        } catch (e) {
            if (e instanceof InvalidCommandArgumentsError) {
                console.log(e.message);
                context.client.error(e.message);
            } else {
                throw e;
            }
        }
    }

    public abstract readonly name: string;

    public abstract execute(context: CommandContext): any[] | void;
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
