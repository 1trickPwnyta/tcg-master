import { Card_Pokemon } from "../../cards/Card_Pokemon.js";
import { Move } from "./Move.js";

export class Move_ActivePokemonSelection extends Move<Card_Pokemon> {
    public execute(): void {
        this.player.active.single = this.target.take() as Card_Pokemon;
    }
};
