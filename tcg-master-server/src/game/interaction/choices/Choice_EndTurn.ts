import { Player } from "../../Player.js";

export default (player: Player) => ({
    key: "c",
    text: "end turn",
    action: () => {
        player.opponent.send(player, "ended", player.pronoun.possessive, "turn.");
        player.game.setPhase(GamePhase.Between);
        return true;
    }
});
