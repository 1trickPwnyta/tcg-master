import { EnergyType } from "../../../EnergyType.js";
import { InterruptResolution } from "../../../InterruptResolution.js";
import { Interrupt } from "../../../state/Interrupt.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackContext, AttackWorker } from "../AttackWorker.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Ninetales")
export class Card_Pokemon_BaseSet_Ninetales extends CardWorker_Pokemon {
    public override readonly name: string = "Ninetales";
    public override readonly type: EnergyType = EnergyType.Fire;
    public override readonly stage = "stage1";
    public override readonly evolutionTree: EvolutionTree = EvolutionTree.Vulpix;
    public override readonly hp: number = 80;
    public override readonly weakness: EnergyType | null = EnergyType.Water;
    public override readonly retreatCost: number = 1;

    public override readonly attacks = [
        new class extends AttackWorker {
            dbid = "BaseSet.Ninetales.Lure";
            name = "Lure";
            cost = [ EnergyType.Colorless, EnergyType.Colorless ];
            damage = 0;
            text = "If your opponent has any Benched Pokémon, choose 1 of them and switch it with their Active Pokémon.";

            protected override validateTargets(context: AttackContext, benched_id?: number): Interrupt | null {
                if (benched_id === undefined && context.game.inactivePlayer.bench.cards.length) {
                    return {
                        player: context.game.activePlayer.id,
                        prompt: "Which Pokémon will be lured out?",
                        choices: context.game.inactivePlayer.bench.cards.map(c => ({ text: c.name, target_id: c.id })),
                        resolution: InterruptResolution.AttackTargets,
                        args: [ this.dbid ]
                    };
                } else {
                    return null;
                }
            }

            protected override postEffect(context: AttackContext, _knockedOut: boolean, benched_id?: number): void {
                if (benched_id !== undefined) {
                    context.game.moveCard(context.game.inactivePlayer.active.cards[0].id, context.game.inactivePlayer.active.id, context.game.inactivePlayer.bench.id);
                    context.game.moveCard(benched_id, context.game.inactivePlayer.bench.id, context.game.inactivePlayer.active.id);
                    context.game.send(context.game.getCard(benched_id), "was lured out!");
                }
            }
        }(),
        new class extends AttackWorker {
            dbid = "BaseSet.Ninetales.FireBlast";
            name = "Fire Blast";
            cost = [ EnergyType.Fire, EnergyType.Fire, EnergyType.Fire, EnergyType.Fire ];
            damage = 80;
            text = `Discard 1 ${EnergyType.Fire} Energy card attached to Ninetales in order to use this attack.`;

            protected override validateTargets(context: AttackContext, energy_id?: number): Interrupt | null {
                if (energy_id === undefined) {
                    return {
                        player: context.game.activePlayer.id,
                        prompt: "Discard which Energy card from Ninetales?",
                        choices: context.game.getEnergy(context.attacker.id).filter(e => e.worker.type == EnergyType.Fire).map(e => ({
                            text: e.card.name, target_id: e.card.id
                        })),
                        resolution: InterruptResolution.AttackTargets,
                        args: [ this.dbid ]
                    };
                } else {
                    return null;
                }
            }

            protected override postEffect(context: AttackContext, _knockedOut: boolean, energy_id: number): void {
                context.game.moveCard(energy_id, context.attacker.attachments.id, context.game.getPlayer(context.attacker.owner_id)!.discard.id);
            }
        }()
    ];
};
