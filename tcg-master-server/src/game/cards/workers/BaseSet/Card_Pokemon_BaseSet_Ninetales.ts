import { EnergyType } from "../../../EnergyType.js";
import { Attack } from "../../Attack.js";
import { Card } from "../../Card.js";
import { Card_Energy } from "../../Card_Energy.js";
import { Card_Pokemon, EvolutionStage } from "../../Card_Pokemon.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { ITargeter } from "../../ITargeter.js";
import { TargetSelector } from "../../TargetSelector.js";

export class Card_Pokemon_BaseSet_Ninetales extends Card_Pokemon {
    public override readonly name: string = "Ninetales";
    public override readonly type: EnergyType = EnergyType.Fire;
    public override readonly stage: EvolutionStage = EvolutionStage.Stage1;
    public override readonly evolutionTree: EvolutionTree = EvolutionTree.Vulpix;
    public override readonly hp: number = 80;
    public override readonly attacks: Attack[] = [ new Attack_Lure(this), new Attack_FireBlast(this) ];
    public override readonly weakness: EnergyType | null = EnergyType.Water;
    public override readonly retreatCost: number = 1;
}

class Attack_Lure extends Attack implements ITargeter<Card_Pokemon> {
    public override readonly name: string = "Lure";
    public override readonly cost: EnergyType[] = [ EnergyType.Colorless, EnergyType.Colorless ];
    public override readonly damage: number = 0;
    public override readonly text: string = "If your opponent has any Benched Pokémon, choose 1 of them and switch it with their Active Pokémon.";
    protected override readonly targetSelector: TargetSelector<Card> = new TargetSelector<Card_Pokemon>(this);

    public get prompt(): string {
        return `Select a Pokémon from ${this.owner.opponent}'s bench to switch with ${this.owner.opponent.active.single}.`;
    }

    public get choices(): Card_Pokemon[] {
        return this.owner.opponent.bench.cards;
    }

    protected override postEffect(benched: Card_Pokemon): void {
        this.owner.opponent.active.single!.switch(benched);
        this.game.send(benched, "was lured out!");
    }
}

class Attack_FireBlast extends Attack implements ITargeter<Card_Energy> {
    public override readonly name: string = "Fire Blast";
    public override readonly cost: EnergyType[] = [ EnergyType.Fire, EnergyType.Fire, EnergyType.Fire, EnergyType.Fire ];
    public override readonly damage: number = 80;
    public override readonly text: string = `Discard 1 ${EnergyType.Fire} Energy card attached to Ninetales in order to use this attack.`;
    protected override readonly targetSelector: TargetSelector<Card> = new TargetSelector<Card_Energy>(this);

    public get prompt(): string {
        return `Select a ${EnergyType.Fire} energy card to discard from ${this.parent}.`;
    }

    public get choices(): Card_Energy[] {
        return this.parent.energy.cards.filter(c => c.type == EnergyType.Fire);
    }

    protected override preEffect(energy: Card_Energy): number {
        energy.discard();
        return 0;
    }
}