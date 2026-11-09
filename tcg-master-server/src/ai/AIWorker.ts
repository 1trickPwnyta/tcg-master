import { parentPort } from "worker_threads";
import { GameEngine } from "../game/engine/GameEngine.js";
import "../extensions.js";
import { Client_AIWorker, HistoryEntry } from "./Client_AIWorker.js";
import { AIContext, ScoredChoice } from "./Client_AI.js";
import { SerializationHydrate } from "../game/state/serializer.js";

const { DefDatabase } = await import("../defs/DefDatabase.js");
await DefDatabase.init();
await import("../loader.js");

parentPort?.on("message", async (context: AIContext) => {
    const state = SerializationHydrate(JSON.parse(context.state));
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
        for (const player of state.players) {
            const client = new Client_AIWorker(1, context.player_id, clientCallback);
            client.player_id = player.id;
            clients.push(client);
        }
        
        const engine = new GameEngine(clients[0], clients[1]);
        engine.start(state.clone(engine));
        engine.interrupts.resolve(context.player_id, choice.i);
        if (engine.game.winner_id) {
            clientCallback({ score: engine.game.winner_id === context.player_id ? Number.MAX_VALUE : Number.MIN_VALUE, history: [] });
        }
    }
});