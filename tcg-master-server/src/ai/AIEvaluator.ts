import { GameEngine } from "../game/engine/GameEngine.js";

export class AIEvaluator {
    public static evaluate(engine: GameEngine, for_player: number): number {
        if (engine.game.winner_id === for_player) {
            return Number.MAX_VALUE;
        } else if (engine.game.winner_id !== undefined) {
            return Number.MIN_VALUE;
        }
    
        const player = engine.game.players.find(p => p.id === for_player)!;
        const opponent = engine.game.players.find(p => p.id !== for_player)!;
        const active = player.activePokemon;
        const activeDef = active?.def;
        const activeHp = activeDef ? activeDef.hp - active!.damage : 0;
        const activeEnergy = activeDef ? active.energy : [];
        const unsatisfiedEnergyCosts = activeDef ? activeDef.attacks.flatMap(a => a.costUnsatisfied(activeEnergy)) : [];
        const activeHighestDamage = activeDef ? ([ ...activeDef.attacks.filter(a => a.costSatisfied(activeEnergy)) ].sort((a, b) => b.damage - a.damage)[0]?.damage ?? 0) : 0;
        const xactive = opponent.activePokemon;
        const xactiveDef = xactive?.def;
        const xactiveHp = xactiveDef ? xactiveDef.hp - xactive!.damage : 0;
        const xactiveEnergy = xactiveDef ? xactive.energy : [];
        const xunsatisfiedEnergyCosts = xactiveDef ? xactiveDef.attacks.flatMap(a => a.costUnsatisfied(xactiveEnergy)) : [];
        const xactiveHighestDamage = xactiveDef ? ([ ...xactiveDef.attacks.filter(a => a.costSatisfied(xactiveEnergy)) ].sort((a, b) => b.damage - a.damage)[0]?.damage ?? 0) : 0;
    
        const benchSize = player.bench.count;
        const xbenchSize = opponent.bench.count;

        const handSize = player.hand.count + player.limbo.count;
        const deckSize = player.deck.count;
        const xhandSize = opponent.hand.count + opponent.limbo.count;
        const xdeckSize = opponent.deck.count;

        let score = 0;
        
        score += opponent.prizes.count * 100;
        score -= player.prizes.count * 100;
        
        score += activeDef ? activeHp / activeDef.hp * 40 : 0;
        score -= xactiveDef ? xactiveHp / xactiveDef.hp * 40 : 0;
        
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
