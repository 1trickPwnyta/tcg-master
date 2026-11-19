import { Choice } from "../game/state/Choice.js";

export class AIPruner {
    public static prune(choices: Choice[]): Choice[] {
        return AIPruner.pruneDuplicates(choices);
    }

    private static pruneDuplicates(choices: Choice[]): Choice[] {
        const labels: string[] = [];
        for (const choice of choices) {
            if (!labels.includes(choice.label)) {
                labels.push(choice.label);
            }
        }
        return labels.map(l => choices.find(c => c.label === l)!);
    }
};
