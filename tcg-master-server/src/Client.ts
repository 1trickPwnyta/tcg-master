import { GameEngine } from "./game/engine/GameEngine.js";
import { CardState } from "./game/state/CardState.js";
import { InterruptSync } from "./game/state/interrupts/Interrupt.js";
import { PlayerState } from "./game/state/PlayerState.js";
import { IToken } from "./IToken.js";

export abstract class Client {
    public game: GameEngine | undefined;
    public player_id: number | undefined;
    public abstract name: string;

    public abstract send(...parts: any[]): void;

    public abstract error(...parts: any[]): void;

    public abstract prompt(interrupt: InterruptSync): void;

    public wait() { }

    public notify_endOfTurn() { }

    public notify_gameOver(winner: PlayerState) { }

    public static tokenize(...parts: any[]): IToken[] {
        return parts.map(p => p.token ?? (p.name ? p : null) ?? { name: p.toString() });
    }

    public static getCardList(cards: CardState[]): IToken[] {
        return cards.length ? Client.tokenize(...cards.map(c => ({ name: `[${c.token.name}]`, type: c.token.type }))) : [ { name: "(empty)" } ];
    }
};
