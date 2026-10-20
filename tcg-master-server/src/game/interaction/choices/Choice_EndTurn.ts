import { Game, GameState } from "../../Game.js";
import { Player } from "../../Player.js";

export default (game: Game, player: Player) => ({
    text: "end turn",
    action: () => {
        player.opponent.send(`${player.name} ended ${player.pronoun.possessive} turn.`);
        game.setState(GameState.Between);
        return true;
    }
});
