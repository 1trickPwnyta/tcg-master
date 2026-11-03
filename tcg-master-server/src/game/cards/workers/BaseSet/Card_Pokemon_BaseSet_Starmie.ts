import { EnergyType } from "../../../EnergyType.js";
import { InterruptResolution } from "../../../InterruptResolution.js";
import { Interrupt } from "../../../state/Interrupt.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackContext, AttackWorker } from "../AttackWorker.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Starmie")
export class Card_Pokemon_BaseSet_Starmie extends CardWorker_Pokemon {
    public override readonly name: string = "Starmie";
    public override readonly type: EnergyType = EnergyType.Water;
    public override readonly stage = "stage1";
    public override readonly evolutionTree: EvolutionTree = EvolutionTree.Staryu;
    public override readonly hp: number = 60;
    public override readonly weakness: EnergyType | null = EnergyType.Lightning;
    public override readonly retreatCost: number = 1;

    public override readonly attacks = [
        new class extends AttackWorker {
            dbid = "BaseSet.Starmie.Recover";
            name = "Recover";
            cost = [ EnergyType.Water, EnergyType.Water ];
            damage = 0;
            text = `Discard 1 ${EnergyType.Water} Energy card attached to Starmie in order to use this attack. Remove all damage counters from Starmie.`;

            protected override validateTargets(context: AttackContext, energy_id?: number): Interrupt | null {
                if (energy_id === undefined) {
                    return {
                        player: context.game.activePlayer.id,
                        prompt: "Discard which Energy card from Starmie?",
                        choices: context.game.getEnergy(context.attacker.id).filter(e => e.worker.type == EnergyType.Water).map(e => ({
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
                context.game.healPokemon(context.game.activePlayer.id, context.attacker.id, context.attacker.damage);
            }
        }(),
        new class extends AttackWorker {
            dbid = "BaseSet.Starmie.StarFreeze";
            name = "Star Freeze";
            cost = [ EnergyType.Water, EnergyType.Colorless, EnergyType.Colorless ];
            damage = 20;
            text = "Flip a coin. If heads, the Defending Pokémon is now Paralyzed.";

            protected override postEffect(context: AttackContext, knockedOut: boolean): void {
                if (!knockedOut && context.game.flipCoin(context.game.activePlayer.id)) {
                    context.game.paralyzePokemon(context.game.inactivePlayer.id, context.defender.id);
                }
            }
        }()
    ];
};
