import { PokemonCardDef } from "../defs/PokemonCardDef.js";
import { DefDatabase } from "../defs/DefDatabase.js";
import { GameEngine } from "../game/engine/GameEngine.js";

export class AIEvaluator {
    public static evaluate(engine: GameEngine, for_player: number): number {
        const state = engine.state;

        if (state.winner_id === for_player) {
            return Number.MAX_VALUE;
        } else if (state.winner_id !== undefined) {
            return Number.MIN_VALUE;
        }
    
        const player = state.players.find(p => p.id === for_player)!;
        const opponent = state.players.find(p => p.id !== for_player)!;
        const active = player.active.cards[0];
        const activeCard = active ? DefDatabase.get<PokemonCardDef>(active.def) : null;
        const activeHp = activeCard ? activeCard.hp - active.damage : 0;
        const activeEnergy = activeCard ? engine.pokemon.getEnergy(active.id).map(e => e.def) : [];
        const unsatisfiedEnergyCosts = activeCard ? activeCard.attacks.flatMap(a => a.costUnsatisfied(activeEnergy)) : [];
        const activeHighestDamage = activeCard ? ([ ...activeCard.attacks.filter(a => a.costSatisfied(activeEnergy)) ].sort((a, b) => b.damage - a.damage)[0]?.damage ?? 0) : 0;
        const xactive = opponent.active.cards[0];
        const xactiveCard = xactive ? DefDatabase.get<PokemonCardDef>(xactive.def) : null;
        const xactiveHp = xactiveCard ? xactiveCard.hp - xactive.damage : 0;
        const xactiveEnergy = xactiveCard ? engine.pokemon.getEnergy(xactive.id).map(e => e.def) : [];
        const xunsatisfiedEnergyCosts = xactiveCard ? xactiveCard.attacks.flatMap(a => a.costUnsatisfied(xactiveEnergy)) : [];
        const xactiveHighestDamage = xactiveCard ? ([ ...xactiveCard.attacks.filter(a => a.costSatisfied(xactiveEnergy)) ].sort((a, b) => b.damage - a.damage)[0]?.damage ?? 0) : 0;
    
        const benchSize = player.bench.cards.length;
        const xbenchSize = opponent.bench.cards.length;

        const handSize = player.hand.cards.length + player.limbo.cards.length;
        const deckSize = player.deck.cards.length;
        const xhandSize = opponent.hand.cards.length + opponent.limbo.cards.length;
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

        score += benchSize ? 20 + (benchSize - 1) * 2 : 0;
        score -= xbenchSize ? 20 + (xbenchSize - 1) * 2 : 0;

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

        score -= player.menus / 10;
        
        return score;
    };
};
