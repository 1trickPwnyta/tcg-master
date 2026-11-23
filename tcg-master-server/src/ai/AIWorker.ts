/*
    Notes for future AI speedup development:
    1. Convert to hybrid minimax/heuristic model by using the AIPruner to prune strategically bad moves
    2. Use Choice hint_priority to give types of moves that are often strategically viable a higher score
    3. Switch to single game state with transactions and rollbacks to see if it's faster than cloning
*/

import { parentPort } from "worker_threads";
import { GameEngine } from "../game/engine/GameEngine.js";
import "../extensions.js";
import { AIContext } from "./Client_AI.js";
import { SerializationHydrate } from "../game/state/serializer.js";
import { Game } from "../game/state/Game.js";
import { AIEvaluator } from "./AIEvaluator.js";
import { Choice } from "../game/state/interrupts/Choice.js";
import { AIPruner } from "./AIPruner.js";
import { IllegalMoveError } from "../game/state/interrupts/InterruptResolver.js";

const { DefDatabase } = await import("../defs/DefDatabase.js");
await DefDatabase.init();
await import("../loader.js");

const DEBUG: boolean = false;

const enum TTFlag { Exact, LowerBound, UpperBound }
interface TTEntry { remainingDepth: number, score: number, flag: TTFlag }

parentPort?.on("message", async (context: AIContext) => {
    const engine = new GameEngine(null, null);
    const game = SerializationHydrate(JSON.parse(context.game), engine) as Game;
    engine.startSimulation(game);

    const tt = new Map<number, TTEntry>();
    expectiminimax(game, context.player_id, 0, -Infinity, Infinity, 0, tt);
});

const MAX_DEPTH = 9;
function expectiminimax(game: Game, for_player: number, depth: number, alpha: number, beta: number, actions: number, tt: Map<number, TTEntry>): { score: number } {
    const initAlpha = alpha;
    const initBeta = beta;
    const remainingDepth = MAX_DEPTH - depth;

    const hash = depth > 0 ? game.hash() : 0;
    if (depth > 0) {
        const cached = tt.get(hash);
        if (cached && cached.remainingDepth >= remainingDepth) {
            if (cached.flag === TTFlag.Exact) {
                return { score: cached.score };
            } else if (cached.flag === TTFlag.LowerBound) {
                alpha = Math.max(alpha, cached.score);
            } else if (cached.flag === TTFlag.UpperBound) {
                beta = Math.min(beta, cached.score);
            }
            if (alpha >= beta) {
                return { score: cached.score };
            }
        }
    }

    if (game.winner_id || depth === MAX_DEPTH) {
        const score = AIEvaluator.evaluate(game, for_player);
        return { score: score };
    }

    const me = game.getPlayer(for_player);
    const myInterrupt = game.interrupt?.getInterruptFor(me.id);
    const theirInterrupt = game.interrupt?.getInterruptFor(me.opponent.id);
    const myTurn = myInterrupt !== null;
    const interrupt = myInterrupt ?? theirInterrupt!;
    const choices: (Choice | null)[] = AIPruner.prune([ ...interrupt.choices ].sort((a, b) => b.hint_priority - a.hint_priority));
    if (!interrupt.force) {
        choices.push(null);
    }

    let bestChoice = undefined;
    let highScore = myTurn ? -Infinity : Infinity;
    let lowestActionsOnTie = Infinity;
    
    for (const choice of choices) {
        const engine = new GameEngine(null, null);
        const clone = game.clone(engine);
        engine.startSimulation(clone);

        const currentTurn = clone.turn?.player;
        try {
            engine.interrupts.resolve(interrupt.player, choice ? interrupt.choices.indexOf(choice) : null);
        } catch (e: any) {
            if (e instanceof IllegalMoveError) {
                continue;
            } else {
                throw e;
            }
        }
        const newTurn = clone.turn?.player;

        let cloneActions = actions;
        if (myTurn) {
            cloneActions++;
        }
        if (currentTurn !== newTurn) {
            cloneActions = 0;
        }

        const result = expectiminimax(clone, for_player, depth + 1, alpha, beta, cloneActions, tt);
        if (choice === null && myTurn) {
            result.score -= 300;
        }
        if (myTurn) {
            result.score += choice?.aiScoreOffset ?? 0;
        }

        if (DEBUG && depth === 0) {
            parentPort?.postMessage(`Choice: ${choice?.parts ?? 'CANCEL'} | Actions: ${cloneActions} | Score Received: ${result.score}`);
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

    if (depth > 0 && bestChoice !== undefined || !myTurn) {
        let flag = TTFlag.Exact;
        if (highScore <= initAlpha) {
            flag = TTFlag.UpperBound;
        } else if (highScore >= initBeta) {
            flag = TTFlag.LowerBound;
        }
        tt.set(hash, { remainingDepth: remainingDepth, score: highScore, flag: flag });
    }

    if (depth === 0) {
        if (bestChoice === undefined) {
            console.warn("Minimax failed to find a valid path. Picking default choice.")
            bestChoice = interrupt.force ? choices[0] : null;
        }
        parentPort?.postMessage(bestChoice);
    }

    return { score: highScore };
}
