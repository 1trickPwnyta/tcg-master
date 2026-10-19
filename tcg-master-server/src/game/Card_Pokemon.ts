import { Card } from "./card.js";

export abstract class Card_Pokemon extends Card {
    public abstract readonly hp: number;
    public readonly attachments: Card[] = [];
};
