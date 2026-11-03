import { Choice } from "../game/state/Interrupt.js";
import { Client_AI, ScoredChoice } from "./Client_AI.js";
import { GameEngine } from "../game/engine/GameEngine.js";
import { CardDatabase } from "../game/cards/CardDatabase.js";
import { CardWorker_Pokemon } from "../game/cards/workers/CardWorker_Pokemon.js";
import { CardWorker_Energy } from "../game/cards/workers/CardWorker_Energy.js";
import { PlayerState } from "../game/state/PlayerState.js";

const MAX_DEPTH = 4;

const goodScoreMemory: Map<number, number | null> = new Map<number, number | null>();
const badScoreMemory: Map<number, number | null> = new Map<number, number | null>();

export class Client_AIWorker extends Client_AI {
    public override name: string = "WORKER";
    public readonly depth: number;
    public invalid: boolean = false;
    private callback: ((score: number | null) => void) | null;
    private for_player: number;

    public constructor(depth: number = 1, for_player: number, callback: (score: number | null) => void = () => { }) {
        super();
        this.depth = depth;
        this.for_player = for_player;
        this.callback = callback;
    }

    public override send(..._parts: any[]): void { }

    public override error(..._parts: any[]): void {
        this.invalid = true;
    }

    public override prompt(text: string, choices: Choice[], force: boolean = false) {
        if (!this.callback) {
            return;
        }

        if (this.depth < MAX_DEPTH) {

            const state = this.game!.getState();
            this.interrupt_id = this.game!.getInterrupt(this.player_id!)!.id!;
            const allChoices = Client_AI.getAIChoices({
                prompt: text,
                choices: choices,
                force: force,
                interrupt_id: this.interrupt_id!,
                player_id: this.player_id!,
                state: state
            });
            const validChoices = allChoices.filter(c => c.valid);
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
                            const sorted = scores.filter(s => s.score !== null).sort((a, b) => b.score! - a.score!);
                            const hash = this.game!.getStateHash();
                            let score, scoreMemory;
                            if (this.for_player === this.player_id) {
                                score = sorted[0];
                                scoreMemory = goodScoreMemory;
                            } else {
                                score = sorted[sorted.length - 1];
                                scoreMemory = badScoreMemory;
                            }
                            if (scoreMemory.has(hash)) {
                                if (this.callback) {
                                    this.callback(this.invalid ? null : scoreMemory.get(hash)!);
                                    this.callback = null;
                                }
                            } else {
                                this.game!.resolveInterrupt(this.player_id!, score.choice.i);
                                if (this.callback) {
                                    scoreMemory.set(hash, score.score);
                                    this.callback(this.invalid ? null : score.score);
                                    this.callback = null;
                                }
                            }
                        }
                    });
                    client.player_id = player.id;
                    clients.push(client);
                }
                const clone = JSON.parse(JSON.stringify(state));
                const game = new GameEngine(clients[0], clients[1], undefined, clone);
                game.resolveInterrupt(this.player_id!, choice.i);
            }

        } else if (this.callback) {
            this.callback(this.invalid ? null : this.evaluate());
            this.callback = null;
        }
    }

    public evaluate(): number {
        const state = this.game!.getState();

        if (state.winner_id === this.for_player) {
            return Number.MAX_VALUE;
        } else if (state.winner_id !== undefined) {
            return Number.MIN_VALUE;
        }
    
        const player = state.players.find(p => p.id === this.for_player)!;
        const opponent = state.players.find(p => p.id !== this.for_player)!;
        const active = player.active.cards[0];
        const activeCard = active ? CardDatabase.find<CardWorker_Pokemon>(active.dbid) : null;
        const activeHp = activeCard ? activeCard.hp - active.damage : 0;
        const activeEnergy = activeCard ? active.attachments.cards.map(c => CardDatabase.find<CardWorker_Energy>(c.dbid)) : [];
        const unsatisfiedEnergyCosts = activeCard ? activeCard.attacks.flatMap(a => a.costUnsatisfied(activeEnergy)) : [];
        const activeHighestDamage = activeCard ? ([ ...activeCard.attacks.filter(a => a.costSatisfied(activeEnergy)) ].sort((a, b) => b.damage - a.damage)[0]?.damage ?? 0) : 0;
        const xactive = opponent.active.cards[0];
        const xactiveCard = xactive ? CardDatabase.find<CardWorker_Pokemon>(xactive.dbid) : null;
        const xactiveHp = xactiveCard ? xactiveCard.hp - xactive.damage : 0;
        const xactiveEnergy = xactiveCard ? xactive.attachments.cards.map(c => CardDatabase.find<CardWorker_Energy>(c.dbid)) : [];
        const xunsatisfiedEnergyCosts = xactiveCard ? xactiveCard.attacks.flatMap(a => a.costUnsatisfied(xactiveEnergy)) : [];
        const xactiveHighestDamage = xactiveCard ? ([ ...xactiveCard.attacks.filter(a => a.costSatisfied(xactiveEnergy)) ].sort((a, b) => b.damage - a.damage)[0]?.damage ?? 0) : 0;
    
        const handSize = player.hand.cards.length;
        const deckSize = player.deck.cards.length;
        const xhandSize = opponent.hand.cards.length;
        const xdeckSize = opponent.deck.cards.length;

        let score = 0;
        
        score += opponent.prizes.cards.length * 100;
        score -= player.prizes.cards.length * 100;
        
        score += activeCard ? activeHp / activeCard.hp * 40 : 0;
        score -= xactiveCard ? xactiveHp / xactiveCard.hp * 40 : 0;
        
        score += activeHighestDamage;
        score -= xactiveHighestDamage;

        score -= unsatisfiedEnergyCosts.length * 5;
        score += xunsatisfiedEnergyCosts.length * 5;
        
        score += xactive && activeHighestDamage >= xactiveHp ? 50 : 0;
        score -= active && xactiveHighestDamage >= activeHp ? 50 : 0;

        score += handSize;
        score -= xhandSize;

        if (deckSize < 12) {
            score += deckSize * 2;
        } else {
            score += 11 * 2 + (deckSize - 11) * 0.1;
        }
        if (xdeckSize < 12) {
            score -= xdeckSize * 2;
        } else {
            score -= 11 * 2 + (xdeckSize - 11) * 0.1;
        }
        
        return score;
    };

    public override notify_gameOver(winner: PlayerState): void {
        if (winner.id === this.player_id && this.callback) {
            this.callback(this.evaluate());
        }
        this.callback = null;
    }
};
