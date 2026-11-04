import { InterruptSync } from "../game/state/interrupts/Interrupt.js";
import { Client_AI, ScoredChoice } from "./Client_AI.js";
import { GameEngine } from "../game/engine/GameEngine.js";
import { PlayerState } from "../game/state/PlayerState.js";
import { AIEvaluator } from "./AIEvaluator.js";
import { AIPruner } from "./AIPruner.js";

const MAX_DEPTH = 6;

export class Client_AIWorker extends Client_AI {
    public override name: string = "WORKER";
    public readonly depth: number;
    public invalid: boolean = false;
    private callback: ((score: number | null) => void) | null;
    private for_player: number;
    private history: { hash: number, choice: number | null }[];

    public constructor(depth: number = 1, for_player: number, callback: (score: number | null) => void = () => { }, history?: { hash: number, choice: number | null }[]) {
        super();
        this.depth = depth;
        this.for_player = for_player;
        this.callback = callback;
        this.history = history ?? [];
    }

    public override send(..._parts: any[]): void { }

    public override error(..._parts: any[]): void {
        this.invalid = true;
    }

    public override prompt(interrupt: InterruptSync) {
        if (!this.callback) {
            return;
        }

        if (this.depth < MAX_DEPTH) {
            const state = this.game!.getState();
            const hash = this.game!.getStateHash();
            this.interrupt_id = interrupt.id!;
            const allChoices = AIPruner.prune(this.game!, interrupt);
            const validChoices = allChoices.filter(c => c.valid && !this.history.some(h => h.hash === hash && h.choice === c.i));
            if (validChoices.length) {
                const scores: ScoredChoice[] = [];
                const received: string[] = [];
                for (const choice of validChoices) {
                    const clients: Client_AIWorker[] = [];
                    for (const player of state.players) {
                        const client = new Client_AIWorker(this.depth + 1, this.for_player, (score: number | null) => {
                            received.push(choice.key);
                            if (score !== null) {
                                scores.push({ choice: choice, score: score });
                            }
                            if (received.length === validChoices.length) {
                                if (scores.length) {
                                    const sorted = scores.filter(s => s.score !== null).sort((a, b) => b.score! - a.score!);
                                    let score;
                                    if (this.for_player === this.player_id) {
                                        score = sorted[0];
                                    } else {
                                        score = sorted[sorted.length - 1];
                                    }
                                    if (this.callback) {
                                        this.callback(this.invalid ? null : score.score);
                                        this.callback = null;
                                    }
                                } else if (this.callback) {
                                    this.callback(null);
                                    this.callback = null;
                                }
                            }
                        }, [ ...this.history, { hash: hash, choice: choice.i } ]);
                        client.player_id = player.id;
                        clients.push(client);
                    }
                    const clone = JSON.parse(JSON.stringify(state));
                    const game = new GameEngine(clients[0], clients[1], undefined, clone);
                    game.interrupts.resolve(this.player_id!, choice.i);
                }
            } else {
                this.callback(this.invalid ? null : AIEvaluator.evaluate(this.game!, this.for_player));
                this.callback = null;
                return;
            }
        } else if (this.callback) {
            this.callback(this.invalid ? null : AIEvaluator.evaluate(this.game!, this.for_player));
            this.callback = null;
        }
    }

    public override notify_gameOver(winner: PlayerState): void {
        if (winner.id === this.player_id && this.callback) {
            this.callback(AIEvaluator.evaluate(this.game!, this.for_player));
        }
        this.callback = null;
    }
};
