import { DefDatabase } from "../../defs/DefDatabase.js";
import { EnergyTypeDef } from "../../defs/EnergyTypeDef.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { InterruptType } from "../state/interrupts/InterruptType.js";
import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_SacrificeEnergy extends AttackWorker {
    private sacrifice: EnergyTypeDef[];

    public constructor(args: any) {
        super();
        this.sacrifice = args.sacrifice.map((e: string) => DefDatabase.get<EnergyTypeDef>(e));
    }

    public override validateTargets(context: AttackContext, ...energy_id: number[]): Interrupt | null {
        if (energy_id.length < this.sacrifice.length) {
            return {
                type: InterruptType.Discard,
                player: context.engine.players.active.id,
                prompt: `Discard which Energy card from ${context.attacker.name}?`,
                choices: context.engine.pokemon.getEnergy(context.attacker.id).filter(e => e.def.type == this.sacrifice[energy_id.length]).map(e => ({
                    text: e.card.name, target_id: e.card.id
                })),
                resolution: InterruptResolution.AttackTargets,
                args: [ context.attack.name, ...energy_id ]
            };
        } else {
            return null;
        }
    }

    public override postEffect(context: AttackContext, knockedOut: boolean, ...energy_id: number[]) {
        for (const energy of energy_id) {
            context.engine.cards.move(energy, context.attacker.attachments.id, context.engine.players.get(context.attacker.owner_id)!.discard.id);
        }
    }
};
