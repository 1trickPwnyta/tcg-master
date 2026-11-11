import { DefDatabase } from "../../defs/DefDatabase.js";
import { EnergyTypeDef } from "../../defs/EnergyTypeDef.js";
import { Choice } from "../state/Choice.js";
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
                player: context.engine.game.activePlayer.id,
                prompt: `Discard which Energy card from ${context.attacker.name}?`,
                choices: context.attacker.energy.filter(e => e.def.type == this.sacrifice[energy_id.length]).map(e => new Choice(e)),
                resolution: InterruptResolution.AttackTargets,
                args: [ context.attack.name, ...energy_id ]
            };
        } else {
            return null;
        }
    }

    public override postEffect(context: AttackContext, _knockedOut: boolean, ...energy_id: number[]) {
        for (const energy of energy_id) {
            const card = context.engine.search.getCard(energy)!;
            card.discard();
        }
    }
};
