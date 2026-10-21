import { Player } from "./game/Player.js";
import { Prompt } from "./game/interaction/prompts/Prompt.js";

export abstract class Client {
    protected readonly player: Player;

    public constructor(player: Player) {
        this.player = player;
    }

    public abstract send(...parts: any[]): void;

    public abstract error(message: string): void;

    public abstract prompt(prompt: Prompt | null): void;

    public static tokenize(...parts: any[]): Token[] {
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
                    tokens.push(new Token(part.toString(), part.tokenType));
                }
            }
        }
        return tokens;
    }
};

export class Token {
    public text: string;
    public type: string | undefined;

    public constructor(text: string, type: string | undefined) {
        this.text = text;
        this.type = type;
    }

    public setText(text: string): Token {
        this.text = text;
        return this;
    }

    public setType(type: string | undefined): Token {
        this.type = type;
        return this;
    }
};
