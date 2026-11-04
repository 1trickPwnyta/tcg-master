import { parentPort } from "worker_threads";
import { GameEngine } from "../game/engine/GameEngine.js";
import "../extensions.js";
import "../loader.js"
import { Client_AIWorker, HistoryEntry } from "./Client_AIWorker.js";
import { AIContext, ScoredChoice } from "./Client_AI.js";

parentPort?.on("message", async (context: AIContext) => {
    const scores: ScoredChoice[] = [];
    let received = 0;
    const validChoices = context.choices.filter(c => c.valid);
    for (const choice of validChoices) {
        const clients: Client_AIWorker[] = [];
        const clientCallback = (results: { score: number | null, history: HistoryEntry[] }) => {
            if (results.score !== null) {
                scores.push({ choice: choice, score: results.score, history: results.history });
            }
            if (++received === validChoices.length) {
                parentPort?.postMessage(scores);
            }
        };
        for (const player of context.state.players) {
            const client = new Client_AIWorker(1, context.player_id, clientCallback);
            client.player_id = player.id;
            clients.push(client);
        }
        
        const game = new GameEngine(clients[0], clients[1], undefined, JSON.parse(JSON.stringify(context.state)));
        game.interrupts.resolve(context.player_id, choice.i);
        if (game.getState().winner_id) {
            clientCallback({ score: game.getState().winner_id === context.player_id ? Number.MAX_VALUE : Number.MIN_VALUE, history: [] });
        }
    }
});