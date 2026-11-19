import { parentPort } from "worker_threads";
import { GameEngine } from "../game/engine/GameEngine.js";
import "../extensions.js";
import { AIContext } from "./Client_AI.js";
import { SerializationHydrate } from "../game/state/serializer.js";
import { Game } from "../game/state/Game.js";
import { AIEvaluator } from "./AIEvaluator.js";
import { Choice } from "../game/state/Choice.js";
import { AIPruner } from "./AIPruner.js";

const { DefDatabase } = await import("../defs/DefDatabase.js");
await DefDatabase.init();
await import("../loader.js");

parentPort?.on("message", async (context: AIContext) => {
    const engine = new GameEngine(null, null);
    const game = SerializationHydrate(JSON.parse(context.game), engine) as Game;
    engine.start(game);
    expectiminimax(game, context.player_id, 0, -Infinity, Infinity, 0);
});

const MAX_DEPTH = 6;
function expectiminimax(game: Game, for_player: number, depth: number, alpha: number, beta: number, actions: number): { score: number } {
    if (game.winner_id || depth === MAX_DEPTH) {
        const score = AIEvaluator.evaluate(game, for_player);
        return { score: score };
    }

    const me = game.getPlayer(for_player);
    const myInterrupt = game.getInterrupt(me.id);
    const theirInterrupt = game.getInterrupt(me.opponent.id);
    const myTurn = myInterrupt !== null;
    const interrupt = myInterrupt ?? theirInterrupt!;
    const choices: (Choice | null)[] = AIPruner.prune([ ...interrupt.choices ].sort((a, b) => {
        if (a.turnEnding && !b.turnEnding) return -1;
        if (!a.turnEnding && b.turnEnding) return 1;
        return 0;
    }));
    if (!interrupt.force) {
        choices.push(null);
    }

    let bestChoice = undefined;
    let highScore = myTurn ? -Infinity : Infinity;
    let lowestActionsOnTie = Infinity;
    
    for (const choice of choices) {
        const engine = new GameEngine(null, null);
        const clone = game.clone(engine);
        engine.start(clone);

        const currentTurn = clone.turn?.player;
        try {
            engine.interrupts.resolve(interrupt.player, choice ? interrupt.choices.indexOf(choice) : null);
        } catch {
            continue;
        }
        const newTurn = clone.turn?.player;

        let cloneActions = actions;
        if (myTurn) {
            cloneActions++;
        }
        if (currentTurn !== newTurn) {
            cloneActions = 0;
        }

        const result = expectiminimax(clone, for_player, depth + 1, alpha, beta, cloneActions);
        if (choice === null && myTurn) {
            result.score -= 300;
        }
        if (myTurn) {
            result.score += choice?.aiScoreOffset ?? 0;
        }

        if (depth === 0) {
            parentPort?.postMessage(`Choice: ${choice?.label ?? 'CANCEL'} | Actions: ${cloneActions} | Score Received: ${result.score}`);
        }

        if (myTurn) {
            if (bestChoice === undefined || result.score > highScore) {
                highScore = result.score;
                bestChoice = choice;
                lowestActionsOnTie = cloneActions;
            } else if (result.score === highScore) {
                if (cloneActions < lowestActionsOnTie) {
                    lowestActionsOnTie = cloneActions;
                    bestChoice = choice;
                }
            }
            alpha = Math.max(alpha, highScore);
        } else {
            if (result.score < highScore) {
                highScore = result.score;
            }
            beta = Math.min(beta, highScore);
        }

        if (beta <= alpha) {
            break;
        }
    }

    if (depth === 0) {
        if (bestChoice === undefined) {
            console.warn("Minimax failed to find a valid path. Picking default choice.")
            bestChoice = interrupt.force ? choices[0] : null;
        }
        parentPort?.postMessage(highScore.toString());
        parentPort?.postMessage(bestChoice);
    }

    return { score: highScore };
}

/*parentPort?.on("message", async (context: AIContext) => {
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
});*/