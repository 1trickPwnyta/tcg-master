import { Player } from "../Player.js";
import { Card } from "./Card.js";

export interface ITargeter<T extends Card> {
    get player(): Player;
    get prompt(): string;
    get choices(): T[];
    execute(...targets: T[]): void;
    cancel(): boolean;
};
