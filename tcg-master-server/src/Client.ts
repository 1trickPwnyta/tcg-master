import { GameEngine } from "./game/engine/GameEngine.js";
import { IToken } from "./IToken.js";

export abstract class Client {
    public game: GameEngine | undefined;
    public player_id: string | undefined;
    public abstract name: string;

    public abstract send(...parts: any[]): void;

    public abstract error(message: string): void;

    public abstract prompt(text: string, choices: string[], force?: boolean): void;

    public static tokenize(...parts: any[]): IToken[] {
        return parts.map(p => p.token ?? (p.name ? p : null) ?? { name: p.toString() });
    }
};
