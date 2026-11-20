import { parentPort } from "node:worker_threads";
import { Choice } from "../game/state/Choice.js";

const DEBUG: boolean = false;

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
        if (DEBUG) {
            parentPort?.postMessage(`Pruned ${choices.length - labels.length} choices.`);
        }
        return labels.map(l => choices.find(c => c.label === l)!);
    }
};
