import { parentPort } from "node:worker_threads";
import { Choice } from "../game/state/interrupts/Choice.js";

const DEBUG: boolean = false;

export class AIPruner {
    public static prune(choices: Choice[]): Choice[] {
        return AIPruner.pruneDuplicates(choices);
    }

    private static pruneDuplicates(choices: Choice[]): Choice[] {
        const pruned: { choice: Choice, label: string }[] = [];
        for (const choice of choices) {
            const label = choice.parts.map(p => p?.name).join("");
            if (!pruned.some(p => p.label === label)) {
                pruned.push({ choice: choice, label: label });
            }
        }
        if (DEBUG) {
            parentPort?.postMessage(`Pruned ${choices.length - pruned.length} choices.`);
        }
        return pruned.map(p => p.choice);
    }
};
