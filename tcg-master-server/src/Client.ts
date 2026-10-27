import { Game } from "./game/Game.js";
import { IToken, Token } from "./Token.js";

export abstract class Client {
    public game: Game | undefined;
    public player_id: string | undefined;
    public abstract name: string;

    public abstract send(...parts: (IToken | string)[]): void;

    public abstract error(message: string): void;

    public abstract prompt(text: string, choices: string[], force?: boolean): void;

    public static tokenize(...parts: (IToken | string)[]): Token[] {
        const tokens: Token[] = [];
        for (const part of parts) {
            if (part instanceof Token) {
                tokens.push(part);
            } else {
                const partTokens = part.tokens;
                if (partTokens) {
                    for (const partToken of partTokens) {
                        tokens.push(partToken);
                    }
                } else {
                    tokens.push(new Token(part.name ?? part.toString(), part.tokenType));
                }
            }
        }
        return tokens;
    }
};
