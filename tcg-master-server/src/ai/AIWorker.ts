import { parentPort } from "worker_threads";
import { GameEngine } from "../game/engine/GameEngine.js";
import "../extensions.js";
import "../loader.js"
import { Client_AIWorker } from "./Client_AIWorker.js";
import { AIContext, Client_AI, ScoredChoice } from "./Client_AI.js";

parentPort?.on("message", async (context: AIContext) => {
    const choices = Client_AI.getAIChoices(context);
    const scores: ScoredChoice[] = [];
    let received = 0;
    for (const choice of choices) {
        const clients: Client_AIWorker[] = [];
        const clientCallback = (score: number | null) => {
            if (score !== null) {
                scores.push({ choice: choice, score: score });
            }
            if (++received === choices.length) {
                parentPort?.postMessage(scores);
            }
        };
        for (const player of context.state.players) {
            const client = new Client_AIWorker(1, context.player_id, clientCallback);
            client.player_id = player.id;
            clients.push(client);
        }
        
        const game = new GameEngine(clients[0], clients[1], undefined, structuredClone(context.state));
        game.resolveInterrupt(context.player_id, choice.i);
        if (game.getState().winner_id) {
            clientCallback(game.getState().winner_id === context.player_id ? Number.MAX_VALUE : Number.MIN_VALUE);
        }
    }
});