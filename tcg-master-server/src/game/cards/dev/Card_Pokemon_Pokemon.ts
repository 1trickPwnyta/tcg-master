import { Card_Pokemon, EvolutionStage } from "../Card_Pokemon.js";

export class Card_Pokemon_Pokemon extends Card_Pokemon {
    public readonly name: string = "Pokemon";
    public readonly stage: EvolutionStage = EvolutionStage.Basic;
    public readonly hp: number = 50;
};
