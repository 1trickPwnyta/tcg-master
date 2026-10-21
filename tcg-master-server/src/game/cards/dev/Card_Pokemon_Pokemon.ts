import { Attack } from "../Attack.js";
import { Card_Pokemon, EvolutionStage } from "../Card_Pokemon.js";

class Attack_Attack extends Attack {
    public override readonly name: string = "Attack";
    public override readonly cost: number = 1;
    public override readonly damage: number = 10;
}

export class Card_Pokemon_Pokemon extends Card_Pokemon {
    public override readonly name: string = "Pokemon";
    public override readonly stage: EvolutionStage = EvolutionStage.Basic;
    public override readonly hp: number = 50;
    public override readonly attacks: Attack[] = [ new Attack_Attack() ];
};