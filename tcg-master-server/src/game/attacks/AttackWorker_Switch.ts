import { Interrupt } from "../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_Switch extends AttackWorker {
    private readonly choice: "attacker" | "defender";

    public constructor(args: any) {
        super();
        this.choice = args.choice;
    }

    public override validateTargets(context: AttackContext, benched?: number): Interrupt | null {
        return this.choice === "attacker" && benched === undefined && context.defender.owner.bench.count ? {
            player: context.attacker.owner.id,
            prompt: "Which Pokémon will be lured out?",
            choices: context.defender.owner.bench.cards.map(c => ({ text: c.name, target_id: c.id })),
            resolution: InterruptResolution.AttackTargets,
            args: [ context.attack.name ]
        } : null;
    }

    public override postEffect(context: AttackContext, knockedOut: boolean, benched?: number) {
        if (!knockedOut) {
            if (this.choice === "attacker" && benched !== undefined) {
                const target = context.engine.search.getCard(benched)!;
                context.defender.owner.bench.add(context.defender);
                context.defender.owner.active.add(target);
                context.engine.send(target, "was lured out!");
            } else if (this.choice === "defender") {
                context.engine.interrupts.interrupt({
                    player: context.defender.owner.id,
                    prompt: "Choose one of your benched Pokémon to switch with your active Pokémon.",
                    choices: context.defender.owner.bench.cards.map(c => ({ text: c.name, target_id: c.id })),
                    force: true,
                    resolution: InterruptResolution.Promote,
                    args: [ context.defender.owner.id ]
                });
            }
        }
    }
};
