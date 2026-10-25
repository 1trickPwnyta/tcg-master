import { Game } from "./game/Game.js";
import { Player } from "./game/Player.js";
import { MoveRequest } from "./game/interaction/moves/MoveRequest.js";
import { Prompt } from "./game/interaction/prompts/Prompt.js";

export abstract class Client {
    protected readonly player: Player;
    private gameOver: boolean = false;

    public constructor(player: Player) {
        this.player = player;
    }

    public get game(): Game {
        return this.player.game;
    }

    public abstract send(...parts: any[]): void;

    public abstract error(message: string): void;

    public abstract requestMove(request: MoveRequest): void;

    public notify_gameOver() {
        this.send("Game over!");
        this.gameOver = true;
    }

    public abstract copy(player: Player): Client;

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
