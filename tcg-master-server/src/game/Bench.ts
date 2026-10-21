import { Client, Token } from "../Client.js";
import { Card_Pokemon } from "./cards/Card_Pokemon.js";
import { Location } from "./Location.js";

export class Bench extends Location<Card_Pokemon> {
    public override toString(): string {
        return !this.empty ? this.cards.map(c => c.getStatus()).join("") : "(empty)";
    }

    public get tokens(): Token[] {
        return Client.tokenize(...this.cards.flatMap(c => [ ...c.getStatus(), "<br />" ]));
    }
};
