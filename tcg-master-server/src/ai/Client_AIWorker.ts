import { Choice } from "../game/state/Interrupt.js";
import { Client_AI, ScoredChoice } from "./Client_AI.js";
import { GameEngine } from "../game/engine/GameEngine.js";
import { Client_HumanSimulator } from "./Client_HumanSimulator.js";
import { CardDatabase } from "../game/cards/CardDatabase.js";
import { CardWorker_Pokemon } from "../game/cards/CardWorker_Pokemon.js";
import { CardWorker_Energy } from "../game/cards/CardWorker_Energy.js";

const MAX_DEPTH = 4;

export class Client_AIWorker extends Client_AI {
    public override name: string = "WORKER";
    public readonly depth: number;
    public invalid: boolean = false;

    public constructor(depth: number = 1) {
        super();
        this.depth = depth;
    }

    public override send(..._parts: any[]): void { }

    public override error(..._parts: any[]): void {
        this.invalid = true;
    }

    // Should we only have the game call this once per clone? Cuz otherwise it will keep playing forever, no?
    public override prompt(text: string, choices: Choice[], force: boolean = false, callback?: () => void) {
        if (this.interrupt_id) {
            return;
        }
        
        if (this.depth < MAX_DEPTH) {

            const allChoices = Client_AI.getAIChoices({
                prompt: text,
                choices: choices,
                force: force,
                interrupt_id: this.interrupt_id!,
                player_id: this.player_id!,
                state: this.game!.getState(),
                attemptedChoices: this.attemptedChoices
            });
            this.interrupt_id = this.game!.getInterrupt(this.player_id!)!.id!;
            const validChoices = allChoices.filter(c => c.valid);
            const scores: ScoredChoice[] = [];
            for (const choice of validChoices) {
                const client = new Client_AIWorker(this.depth + 1);
                client.player_id = this.player_id;
                const game = new GameEngine(client, new Client_HumanSimulator("SIM"), undefined, structuredClone(this.game!.getState()));
                game.resolveInterrupt(this.player_id!, choice.i, () => {
                    if (!client.invalid) {
                        const score = this.evaluate();
                        scores.push({ choice: choice, score: score });
                    }
                });
            }

            const choice = scores.filter(s => s.score !== null).sort((a, b) => b.score! - a.score!)[0].choice;
            this.attemptedChoices.set(choice.key, (this.attemptedChoices.get(choice.key) ?? 0) + 1);
            if (this.interrupt_id === this.game?.getInterrupt(this.player_id!)?.id) {
                this.interrupt_id = null;
                this.game!.resolveInterrupt(this.player_id!, choice.i, callback);
            } else {
                throw new Error(`Attempted to respond to interrupt ${this.interrupt_id} but it wasn't available.`);
            }

        } else if (callback) {
            callback();
        }
    }

    public evaluate(): number {
        const state = this.game!.getState();

        if (state.winner_id === this.player_id) {
            return Number.MAX_VALUE;
        } else if (state.winner_id !== undefined) {
            return Number.MIN_VALUE;
        }
    
        const player = state.players.find(p => p.id === this.player_id)!;
        const opponent = state.players.find(p => p.id !== this.player_id)!;
        const active = player.active.cards[0];
        const activeCard = active ? CardDatabase.find<CardWorker_Pokemon>(active.dbid) : null;
        const activeHp = activeCard ? activeCard.hp - active.damage : 0;
        const activeHighestDamage = activeCard ? ([ ...activeCard.attacks.filter(a => a.costSatisfied(active.attachments.cards.map(c => CardDatabase.find<CardWorker_Energy>(c.dbid)))) ].sort((a, b) => b.damage - a.damage)[0]?.damage ?? 0) : 0;
        const xactive = opponent.active.cards[0];
        const xactiveCard = xactive ? CardDatabase.find<CardWorker_Pokemon>(xactive.dbid) : null;
        const xactiveHp = xactiveCard ? xactiveCard.hp - xactive.damage : 0;
        const xactiveHighestDamage = xactiveCard ? ([ ...xactiveCard.attacks.filter(a => a.costSatisfied(xactive.attachments.cards.map(c => CardDatabase.find<CardWorker_Energy>(c.dbid)))) ].sort((a, b) => b.damage - a.damage)[0]?.damage ?? 0) : 0;
    
        let score = 0;
        
        score += opponent.prizes.cards.length * 100;
        score -= player.prizes.cards.length * 100;
        
        score += activeCard ? activeHp / activeCard.hp * 40 : 0;
        score -= xactiveCard ? xactiveHp / xactiveCard.hp * 40 : 0;
        
        score += activeHighestDamage;
        score -= xactiveHighestDamage;
        
        score += xactive && activeHighestDamage >= xactiveHp ? 50 : 0;
        score -= active && xactiveHighestDamage >= activeHp ? 50 : 0;
        
        return score;
    };

    public override notify_endOfTurn(): void {
        this.attemptedChoices.clear();
    }
};
