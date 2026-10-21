import { Game, GameState } from "../../Game.js";
import { Player } from "../../Player.js";
import { Prompt } from "../prompts/Prompt.js";

export default (game: Game, player: Player) => ({
    text: "attack",
    action: () => {
        const attacker = player.active.single!;
        player.setPrompt(new Prompt(
            `Which attack should ${player.active.single} use?`,
            player.active.single!.attacks.filter(a => attacker.energy.count >= a.cost).map(a => ({
                text: a.name,
                action: () => {
                    a.execute(attacker, player.opponent.active.single!);
                    game.setState(GameState.Between);
                    return true;
                }
            })),
            {
                cancelAction: () => false
            }
        ));

        return true;
    }
});
