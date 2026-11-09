import { InterruptSync } from "../game/state/interrupts/Interrupt.js";
import { Client_AI, ScoredChoice } from "./Client_AI.js";
import { GameEngine } from "../game/engine/GameEngine.js";
import { Player } from "../game/state/Player.js";
import { AIEvaluator } from "./AIEvaluator.js";
import { AIPruner } from "./AIPruner.js";

const MAX_DEPTH = 8;

export type HistoryEntry = {
    hash: number,
    prompt: string,
    choice: number | null,
    text: string | null,
    depth: number
};

export class Client_AIWorker extends Client_AI {
    public override name: string = "WORKER";
    public readonly depth: number;
    public invalid: boolean = false;
    private callback: ((result: { score: number | null, history: HistoryEntry[] }) => void) | null;
    private for_player: number;
    private history: HistoryEntry[];

    public constructor(depth: number = 1, for_player: number, callback: ((result: { score: number | null, history: HistoryEntry[] }) => void) = () => { }, history?: HistoryEntry[]) {
        super();
        this.depth = depth;
        this.for_player = for_player;
        this.callback = callback;
        this.history = history ?? [];
    }

    public override send(..._parts: any[]): void { }

    public override error(..._parts: any[]): void {
        this.invalid = true;
        if (this.callback) {
            this.callback({ score: null, history: this.history });
            this.callback = null;
        }
    }

    public override prompt(interrupt: InterruptSync) {
        if (!this.callback) {
            return;
        }

        // For now, don't let the AI see into the other player's turn (except when it has to make a choice during the other player's turn)
        // because then they want to stall as long as possible to avoid ending their own turn because god forbid the opponent do something they don't like
        // If this interrupt isn't for you and it's not your turn, just return the evaluation score immediately
        if (interrupt.player !== this.for_player && this.engine?.game.turn && this.engine.game.turn?.player !== this.for_player) {
            this.callback({ score: AIEvaluator.evaluate(this.engine!, this.for_player), history: this.history });
            this.callback = null;
            return;
        }

        if (this.depth < MAX_DEPTH) {
            const state = this.engine!.game;
            const hash = this.engine!.game.hash();
            this.interrupt_id = interrupt.id!;
            const allChoices = AIPruner.prune(this.engine!, interrupt);
            const validChoices = allChoices.filter(c => c.valid && !this.history.some(h => h.hash === hash && h.choice === c.i));
            if (validChoices.length) {
                const scores: ScoredChoice[] = [];
                const received: string[] = [];
                for (const choice of validChoices) {
                    const clients: Client_AIWorker[] = [];
                    for (const player of state.players) {
                        const client = new Client_AIWorker(this.depth + 1, this.for_player, (results: { score: number | null, history: HistoryEntry[] }) => {
                            received.push(choice.key);
                            if (results.score !== null) {
                                scores.push({ choice: choice, score: results.score, history: results.history });
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
                                        this.callback({ score: this.invalid ? null : score.score, history: score.history });
                                        this.callback = null;
                                    }
                                } else if (this.callback) {
                                    this.callback({ score: null, history: this.history });
                                    this.callback = null;
                                }
                            }
                        }, [ ...this.history, {
                            hash: hash,
                            prompt: interrupt.prompt,
                            choice: choice.i,
                            text: choice.i !== null ? interrupt.choices[choice.i].text : null,
                            depth: this.depth
                        } ]);
                        client.player_id = player.id;
                        clients.push(client);
                    }
                    const engine = new GameEngine(clients[0], clients[1]);
                    engine.start(state.clone(engine));
                    engine.interrupts.resolve(this.player_id!, choice.i);
                }
            } else {
                this.callback({ score: null, history: this.history });
                this.callback = null;
                return;
            }
        } else if (this.callback) {
            const score = this.invalid ? null : AIEvaluator.evaluate(this.engine!, this.for_player);
            this.callback({ score: score, history: this.history });
            this.callback = null;
        }
    }

    public override notify_gameOver(winner: Player): void {
        if (winner.id === this.player_id && this.callback) {
            this.callback({ score: AIEvaluator.evaluate(this.engine!, this.for_player), history: this.history });
        }
        this.callback = null;
    }
};
