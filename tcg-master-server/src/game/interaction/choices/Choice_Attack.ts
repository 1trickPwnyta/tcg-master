import { CardOrientation } from "../../CardOrientation.js";
import { GameState } from "../../Game.js";
import { Player } from "../../Player.js";
import { Prompt } from "../prompts/Prompt.js";

function selectAttack(player: Player) {
    const attacker = player.active.single!;
    player.setPrompt(new Prompt(
        `Which attack should ${attacker} use?`,
        attacker.attacks.map(a => ({
            text: a.name,
            action: () => {
                if (a.costSatisfied(attacker.energy.cards)) {
                    if (attacker.orientation == CardOrientation.Confused && !player.flipCoin()) {
                        player.game.send(attacker, "hurt itself in confusion!");
                        attacker.takeDamage(20, attacker.type);
                    } else {
                        a.use(attacker, player.opponent.active.single!);
                    }
                    return true;
                } else {
                    player.send(attacker, "doesn't have enough energy to use", a, ".");
                    selectAttack(player);
                    return true;
                }
            }
        })),
        {
            cancelAction: () => true
        }
    ));
}

export default (player: Player) => ({
    text: "attack",
    action: () => {
        selectAttack(player)
        return true;
    }
});
