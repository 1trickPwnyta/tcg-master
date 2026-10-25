import { Card_Pokemon } from "../game/cards/Card_Pokemon.js";
import { Card_Trainer } from "../game/cards/Card_Trainer.js";
import { Player } from "../game/Player.js";

export class AIEvaluator {
    private player: Player;
    private opponent: Player;

    public constructor(player: Player) {
        this.player = player;
        this.opponent = player.opponent;
    }

    private get active(): Card_Pokemon | null {
        return this.player.active.single;
    }

    private get xactive(): Card_Pokemon | null {
        return this.opponent.active.single;
    }

    public evaluate(): number {
        let score = 0;

        // Prize cards remaining
        const myPrizes = this.player.prizes.count;
        const theirPrizes = this.opponent.prizes.count;

        // Active Pokemon health
        const myActiveDamage = this.active ? this.active.damage : 0;
        const theirActiveDamage = this.xactive ? this.xactive.damage : 0;

        // Active Pokemon damage output
        const myDamageOutput = [ ...(this.active?.attacks ?? []) ].filter(a => a.costSatisfied(this.active!.energy.cards)).sort((a, b) => b.damage - a.damage)[0]?.damage ?? 0;
        const theirDamageOutput = [ ...(this.xactive?.attacks ?? []) ].filter(a => a.costSatisfied(this.xactive!.energy.cards)).sort((a, b) => b.damage - a.damage)[0]?.damage ?? 0;

        // Kill shot
        const myKillShot = this.xactive && myDamageOutput >= this.xactive.hp - theirActiveDamage;
        const theirKillShot = this.active && theirDamageOutput >= this.active.hp - myActiveDamage;

        // Remaining Pokemon
        const myBenchPokemon = this.player.bench.count;
        const theirBenchPokemon = this.opponent.bench.count;
        const myHandPokemon = myBenchPokemon ? 0 : this.player.hand.basicPokemon.length;
        const theirHandPokemon = theirBenchPokemon ? 0 : this.opponent.hand.count / 4;

        // Trainers held
        const myTrainers = this.player.hand.cards.filter(c => c instanceof Card_Trainer).length;
        const theirTrainers = this.opponent.hand.count / 3;

        // Hand size
        const myHandSize = this.player.hand.count;
        const theirHandSize = this.opponent.hand.count;
        
        // Deck remaining
        const myDeckRemaining = this.player.deck.count;
        const theirDeckRemaining = this.opponent.deck.count;
        
        // Calculate score
        score -= myPrizes * 100;
        score += theirPrizes * 100;
        score -= myActiveDamage / (this.active?.hp ?? 1) * 100;
        score += theirActiveDamage / (this.xactive?.hp ?? 1) * 100;
        score += myDamageOutput * 1;
        score -= theirDamageOutput * 1;
        score += myKillShot ? 75 : 0;
        score -= theirKillShot ? 75 : 0;
        score += myBenchPokemon > 1 ? -myBenchPokemon * 10 : myBenchPokemon === 1 ? 80 : -80;
        score -= theirBenchPokemon ? 40 : 0;
        score += myHandPokemon * 2;
        score -= theirHandPokemon * 2;
        score += myHandSize * 2;
        score -= theirHandSize * 2;
        score += myTrainers * 5;
        score -= theirTrainers * 5;
        score += (myDeckRemaining - theirDeckRemaining) * (myDeckRemaining > 10 ? 1 : (myDeckRemaining - theirDeckRemaining));

        return score;
    }
};
