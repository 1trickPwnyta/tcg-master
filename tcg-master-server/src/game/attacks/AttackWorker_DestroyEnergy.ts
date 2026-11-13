import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_DestroyEnergy extends AttackWorker {
    public override validateTargets(context: AttackContext, energy: number): Interrupt | null {
        if (!energy && context.defender.attachments.energyCards.length) {
            return {
                player: context.attacker.owner.id,
                prompt: `Choose an energy card to discard from ${context.defender.name}.`,
                choices: context.defender.attachments.energyCards.map(e => new Choice(e.card)),
                resolution: InterruptResolution.AttackTargets,
                args: [ context.attack.name ]
            };
        }

        return null;
    }

    public override postEffect(context: AttackContext, knockedOut: boolean, energy: number): void {
        if (energy && !knockedOut) {
            const card = context.engine.search.getCard(energy, context.defender.attachments)!;
            card.discard();
            context.engine.send(card, "was discarded from", ...context.defender.fullTokens, ".");
        }
    }
};
