import { parentPort } from "worker_threads";
import { GameEngine } from "../game/engine/GameEngine.js";
import { Client_HumanSimulator } from "./Client_HumanSimulator.js";
import "../extensions.js";
import "../loader.js"
import { Client_AIWorker } from "./Client_AIWorker.js";
import { AIContext, Client_AI, ScoredChoice } from "./Client_AI.js";

parentPort?.on("message", async (context: AIContext) => {
    const choices = Client_AI.getAIChoices(context);
    const scores: ScoredChoice[] = [];
    let expected = 0;
    let received = 0;
    for (const choice of choices) {
        const client = new Client_AIWorker();
        client.player_id = context.player_id;
        const game = new GameEngine(client, new Client_HumanSimulator("SIM"), undefined, structuredClone(context.state));
        expected++;
        game.resolveInterrupt(context.player_id, choice.i, () => {
            if (!client.invalid) {
                const score = client.evaluate();
                scores.push({ choice: choice, score: score });
            }
            if (++received === expected) {
                parentPort?.postMessage(scores);
            }
        });
    }
});
