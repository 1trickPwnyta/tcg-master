import { Game, GameState } from "../../Game.js";
import { Player } from "../../Player.js";

export default (game: Game, player: Player) => ({
    text: "attack",
    action: () => {
        if (player.active.single!.energy.count >= 1) {
            game.setState(GameState.Between);
            game.send(`${player}'s ${player.active.single} attacked! ${player.opponent}'s ${player.opponent.active.single} took 10 damage.`);
            player.opponent.active.single!.damageCounters++;
            return true;
        } else {
            player.send(`${player.active.single} doesn't have enough energy.`);
            return true;
        }
    }
});
