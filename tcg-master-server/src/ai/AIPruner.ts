import { PokemonCardDef } from "../defs/PokemonCardDef.js";
import { GameEngine } from "../game/engine/GameEngine.js";
import { Choice } from "../game/state/Choice.js";
import { InterruptSync } from "../game/state/interrupts/Interrupt.js";
import { InterruptResolution } from "../game/state/interrupts/InterruptResolution.js";
import { InterruptType } from "../game/state/interrupts/InterruptType.js";
import { PokemonCard } from "../game/state/PokemonCard.js";
import { AIChoice } from "./Client_AI.js";

export class AIPruner {
    public static prune(engine: GameEngine, interrupt: InterruptSync): AIChoice[] {
        const player = engine.game.getPlayer(interrupt.player);
        let rawChoices: AIChoice[] = [ ...interrupt.choices ].map((c, i) => ({
            i: i,
            target: c.id as number,
            key: AIPruner.getKey(interrupt.player, interrupt.prompt, interrupt.choices, c),
            valid: true
        }));
        
        if (interrupt.type !== undefined && [
            InterruptType.Bench,
            InterruptType.Discard,
            InterruptType.SelectActive
        ].includes(interrupt.type)) {
            rawChoices = this.pruneDuplicates(engine, rawChoices);
        }

        if (interrupt.resolution !== undefined && [
            InterruptResolution.PlayCard
        ].includes(interrupt.resolution)) {
            rawChoices = this.pruneDuplicates(engine, rawChoices);
        }

        let choices: AIChoice[] = rawChoices.map(choice => {
            if (interrupt.resolution !== undefined) {
                switch (interrupt.resolution) {
                    case InterruptResolution.AttachEnergy:
                        const target = engine.search.getCard(choice.target as number) as PokemonCard;
                        const def = target.def as PokemonCardDef;
                        const unsatisfiedAttacks = def.attacks.filter(a => !a.costSatisfied(target.energy));
                        if (!unsatisfiedAttacks.length) {
                            choice.valid = false;
                        }
                        break;
                    case InterruptResolution.UseMulliganBonus:
                        if (choice.target as number < rawChoices.length) {
                            choice.valid = false;
                        }
                        break;
                }
            }

            return choice;
        });

        if (!interrupt.force) {
            let valid = true;

            if (interrupt.type !== undefined) {
                switch (interrupt.type) {
                    case InterruptType.Bench:
                        if (player.bench.count === 0) {
                            valid = false;
                        }
                        break;
                }
            }

            if (interrupt.resolution !== undefined) {
                switch (interrupt.resolution) {
                    case InterruptResolution.UseMulliganBonus:
                        valid = false;
                        break;
                }
            }

            const key = AIPruner.getKey(interrupt.player, interrupt.prompt, interrupt.choices, undefined);
            // Don't allow the AI to cancel a menu, for now, because it makes the AI stupid
            //choices.push({ i: null, target: null, key: key, valid: valid });
        }

        // Don't prune every choice
        if (choices.length && !choices.some(c => c.valid)) {
            choices[0].valid = true;
        }
        
        return choices;
    }

    private static pruneDuplicates(engine: GameEngine, choices: AIChoice[]): AIChoice[] {
        const dbids: { dbid: string, target: number }[] = [];
        for (const choice of choices) {
            const card = engine.search.getCard(choice.target as number)!;
            if (!dbids.some(i => i.dbid === card.def.name)) {
                dbids.push({ dbid: card.def.name, target: card.id });
            }
        }
        return dbids.map(i => choices.find(c => c.target === i.target)!);
    }

    private static getKey(player_id: number, prompt: string, choices: Choice[], choice?: Choice): string {
        return player_id + prompt + choices.map(c => c.label + c.id).join("") + choice?.label + choice?.id;
    }
};
