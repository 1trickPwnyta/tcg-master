import { EnergyType } from "../../EnergyType.js";
import { InterruptResolution } from "../../state/interrupts/InterruptResolution.js";
import { Interrupt } from "../../state/interrupts/Interrupt.js";
import { AttackContext, AttackWorker } from "./AttackWorker.js";
import { InterruptType } from "../../state/interrupts/InterruptType.js";

export type EffectTrigger = "always" | "coin";

export class AttackFactory {
    public static makeAttack(dbid: string, name: string): AttackFactory {
        return new AttackFactory(dbid, name);
    }

    private dbid: string;
    private name: string;
    private cost: EnergyType[] = [];
    private damage: number = 0;
    private text: string | null = null;
    private discardType?: EnergyType;
    private discardAmount?: number;
    private poison?: EffectTrigger;
    private paralyze?: EffectTrigger;
    private confuse?: EffectTrigger;
    private sleep?: EffectTrigger;
    private damagePreventionTrigger?: EffectTrigger;
    private damagePrevention?: number | "damage" | "all";
    private targeting?: (context: AttackContext, ...targets: number[]) => Interrupt | null;
    private preEffects: ((context: AttackContext) => number)[] = [];
    private postEffects: ((context: AttackContext, knockedOut: boolean, ...targets: number[]) => void)[] = [];

    private constructor(dbid: string, name: string) {
        this.dbid = dbid;
        this.name = name;
    }

    public costs(...cost: EnergyType[]): AttackFactory {
        this.cost = cost;
        return this;
    }

    public deals(damage: number): AttackFactory {
        this.damage = damage;
        return this;
    }

    public reads(text: string): AttackFactory {
        this.text = text;
        return this;
    }

    public discards(amount: number, type: EnergyType): AttackFactory {
        this.discardType = type;
        this.discardAmount = amount;
        return this;
    }

    public poisons(trigger: EffectTrigger = "coin"): AttackFactory {
        this.poison = trigger;
        return this;
    }

    public paralyzes(trigger: EffectTrigger = "coin"): AttackFactory {
        this.paralyze = trigger;
        return this;
    }

    public confuses(trigger: EffectTrigger = "coin"): AttackFactory {
        this.confuse = trigger;
        return this;
    }

    public sleeps(trigger: EffectTrigger = "coin"): AttackFactory {
        this.sleep = trigger;
        return this;
    }

    public prevents(amount: number | "damage" | "all", trigger: EffectTrigger = "coin"): AttackFactory {
        this.damagePrevention = amount;
        this.damagePreventionTrigger = trigger;
        return this;
    }

    public targets(targeting: (context: AttackContext, ...targets: number[]) => Interrupt | null): AttackFactory {
        this.targeting = targeting;
        return this;
    }

    public withPreEffect(effect: (context: AttackContext) => number): AttackFactory {
        this.preEffects.push(effect);
        return this;
    }

    public withPostEffect(effect: (context: AttackContext, knockedOut: boolean, ...targets: number[]) => void): AttackFactory {
        this.postEffects.push(effect);
        return this;
    }

    public finalize(): AttackWorker {
        const worker = new AttackWorker(this.dbid, this.name);
        worker.cost = this.cost;
        worker.damage = this.damage;
        worker.text = this.text;
        if (this.discardType && this.discardAmount) {
            worker.validateTargets = (context: AttackContext, energy_id?: number) => {
                if (energy_id === undefined) {
                    return {
                        type: InterruptType.Discard,
                        player: context.game.players.active.id,
                        prompt: `Discard which Energy card from ${context.attacker.name}?`,
                        choices: context.game.pokemon.getEnergy(context.attacker.id).filter(e => e.worker.type == this.discardType).map(e => ({
                            text: e.card.name, target_id: e.card.id
                        })),
                        resolution: InterruptResolution.AttackTargets,
                        args: [ worker.dbid ]
                    };
                } else {
                    return null;
                }
            };
            worker.postEffects.push((context: AttackContext, _knockedOut: boolean, energy_id: number) => {
                context.game.cards.move(energy_id, context.attacker.attachments.id, context.game.players.get(context.attacker.owner_id)!.discard.id);
            });
        }
        if (this.targeting) {
            worker.validateTargets = this.targeting;
        }
        for (const effect of this.preEffects) {
            worker.preEffects.push(effect);
        }
        if (this.poison) {
            worker.postEffects.push((context: AttackContext, knockedOut: boolean) => {
                if (!knockedOut && this.poison === "always" || context.game.flipCoin(context.game.players.active.id)) {
                    context.game.pokemon.poison(context.game.players.inactive.id, context.defender.id);
                }
            });
        }
        if (this.paralyze) {
            worker.postEffects.push((context: AttackContext, knockedOut: boolean) => {
                if (!knockedOut && this.paralyze === "always" || context.game.flipCoin(context.game.players.active.id)) {
                    context.game.pokemon.paralyze(context.game.players.inactive.id, context.defender.id);
                }
            });
        }
        if (this.confuse) {
            worker.postEffects.push((context: AttackContext, knockedOut: boolean) => {
                if (!knockedOut && this.confuse === "always" || context.game.flipCoin(context.game.players.active.id)) {
                    context.game.pokemon.confuse(context.game.players.inactive.id, context.defender.id);
                }
            });
        }
        if (this.sleep) {
            worker.postEffects.push((context: AttackContext, knockedOut: boolean) => {
                if (!knockedOut && this.sleep === "always" || context.game.flipCoin(context.game.players.active.id)) {
                    context.game.pokemon.sleep(context.game.players.inactive.id, context.defender.id);
                }
            });
        }
        if (this.damagePrevention) {
            worker.postEffects.push((context: AttackContext) => {
                if (this.damagePreventionTrigger === "always" || context.game.flipCoin(context.game.players.active.id)) {
                    switch (this.damagePrevention) {
                        case "all": break;
                        case "damage": context.attacker.damagePrevention = -1; break;
                        default: context.attacker.damagePrevention = this.damagePrevention;
                    }
                }
            });
        }
        for (const effect of this.postEffects) {
            worker.postEffects.push(effect);
        }
        return worker;
    }
};
