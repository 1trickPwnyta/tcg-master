import { CardDatabase } from "../game/cards/CardDatabase.js";
import { CardWorker_Pokemon } from "../game/cards/workers/CardWorker_Pokemon.js";
import { GameEngine } from "../game/engine/GameEngine.js";
import { Choice, InterruptSync } from "../game/state/interrupts/Interrupt.js";
import { InterruptResolution } from "../game/state/interrupts/InterruptResolution.js";
import { InterruptType } from "../game/state/interrupts/InterruptType.js";
import { AIChoice } from "./Client_AI.js";

export class AIPruner {
    public static prune(game: GameEngine, interrupt: InterruptSync): AIChoice[] {
        const player = game.players.get(interrupt.player);
        let rawChoices: AIChoice[] = [ ...interrupt.choices ].map((c, i) => ({
            i: i,
            target: c.target_id as number,
            key: AIPruner.getKey(interrupt.player, interrupt.prompt, interrupt.choices, c),
            valid: true
        }));
        
        if (interrupt.type !== undefined && [
            InterruptType.Bench,
            InterruptType.Discard,
            InterruptType.SelectActive
        ].includes(interrupt.type)) {
            rawChoices = this.pruneDuplicates(game, rawChoices);
        }

        if (interrupt.resolution !== undefined && [
            InterruptResolution.PlayCard
        ].includes(interrupt.resolution)) {
            rawChoices = this.pruneDuplicates(game, rawChoices);
        }

        let choices: AIChoice[] = rawChoices.map(choice => {
            if (interrupt.resolution !== undefined) {
                switch (interrupt.resolution) {
                    case InterruptResolution.AttachEnergy:
                        const target = game.search.getCard(choice.target as number)!;
                        const worker = CardDatabase.find(target.dbid);
                        const pokemon = worker as CardWorker_Pokemon
                        const energy = game.pokemon.getEnergy(choice.target as number).map(e => e.worker);
                        const unsatisfiedAttacks = pokemon.attacks.filter(a => !a.costSatisfied(energy));
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
                        if (player.bench.cards.length === 0) {
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
        if (!choices.some(c => c.valid)) {
            choices[0].valid = true;
        }
        
        return choices;
    }

    private static pruneDuplicates(game: GameEngine, choices: AIChoice[]): AIChoice[] {
        const dbids: { dbid: string, target: number }[] = [];
        for (const choice of choices) {
            const card = game.search.getCard(choice.target as number)!;
            if (!dbids.some(i => i.dbid === card.dbid)) {
                dbids.push({ dbid: card.dbid, target: card.id });
            }
        }
        return dbids.map(i => choices.find(c => c.target === i.target)!);
    }

    private static getKey(player_id: number, prompt: string, choices: Choice[], choice?: Choice): string {
        return player_id + prompt + choices.map(c => c.text + c.target_id).join("") + choice?.text + choice?.target_id;
    }
};
