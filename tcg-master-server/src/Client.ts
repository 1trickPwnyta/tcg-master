import { GameEngine } from "./game/engine/GameEngine.js";
import { Choice } from "./game/state/Interrupt.js";
import { IToken } from "./IToken.js";

export abstract class Client {
    public game: GameEngine | undefined;
    public player_id: string | undefined;
    public abstract name: string;

    public abstract send(...parts: any[]): void;

    public abstract error(...parts: any[]): void;

    public abstract prompt(text: string, choices: Choice[], force?: boolean, callback?: () => void): void;

    public wait() { }

    public notify_endOfTurn() { }

    public static tokenize(...parts: any[]): IToken[] {
        return parts.map(p => p.token ?? (p.name ? p : null) ?? { name: p.toString() });
    }
};
