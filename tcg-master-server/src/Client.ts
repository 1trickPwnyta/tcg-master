import { CardDef } from "./defs/CardDef.js";
import { GameEngine } from "./game/engine/GameEngine.js";
import { Card } from "./game/state/Card.js";
import { InterruptSync } from "./game/state/interrupts/Interrupt.js";
import { Player } from "./game/state/Player.js";
import { IToken } from "./IToken.js";

export enum ClientEventType {
     CardMove = "card_move"
    ,Attack = "attack"
    ,Damage = "damage"
    ,CoinFlip = "coin"
};

export type ClientEvent = {
    type: ClientEventType,
    args: any
};

export abstract class Client {
    public engine: GameEngine | undefined;
    public player_id: number | undefined;
    public player?: Player;

    public abstract start(): void;

    public abstract send(id: number, ...parts: any[]): void;

    public abstract sendEvent(event: ClientEvent): void;

    public abstract sendInfo(...parts: any[]): void;

    public abstract sync(): void;

    public abstract showcase(def: CardDef): void;

    public abstract view(def: CardDef): void;

    public abstract error(message: string): void;

    public abstract prompt(interrupt: InterruptSync): void;

    public wait() { }

    public notify_endOfTurn() { }

    public notify_gameOver(winner: Player) { }

    public static tokenize(...parts: any[]): IToken[] {
        return parts.filter(p => p !== null && p !== undefined).map(p => p?.token ?? p?.def?.token ?? (p?.name ? p : null) ?? { name: p?.toString() });
    }

    public static getCardList(cards: Card[]): IToken[] {
        return cards.length ? Client.tokenize(...cards.map(c => ({ name: `[${c.token.name}]`, type: c.token.type }))) : [ { name: "(empty)" } ];
    }
};
