import { Game } from "../Game.js";
import { Player } from "../Player.js";
import { GamePhase } from "./GamePhase.js";
import { GamePhase_MulliganBonusDraw } from "./GamePhase_MulliganBonusDraw.js";

export class GamePhase_Setup extends GamePhase<never> {
    protected override getMoveRequests(_game: Game): never[] {
        return [];
    }

    public override evaluate(game: Game): GamePhase<any> {
        for (const player of game.players) {
            player.send("Welcome!");
            player.deck.shuffle();
            const mulligans = this.drawHand(player);
            game.mulligansTaken[player.id] = mulligans;
        };
        return new GamePhase_MulliganBonusDraw(game);
    }

    private drawHand(player: Player, mulligans: number = 0): number {
        player.draw(7);
        if (player.hand.basicPokemon.length) {
            return mulligans;
        } else {
            player.game.send(player, "has no basic Pokémon in", player.pronoun.possessive, "hand.", player.pronoun.objective.capitalizeFirst(), "must take a mulligan.");
            player.deck.addMany(player.hand.takeAll());
            player.deck.shuffle();
            return this.drawHand(player, mulligans + 1);
        }
    }
};
