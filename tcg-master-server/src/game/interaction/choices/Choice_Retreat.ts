import { Card_Pokemon } from "../../cards/Card_Pokemon.js";
import { Player } from "../../Player.js";
import { Prompt_SelectCard } from "../prompts/Prompt_SelectCard.js";

export default (player: Player) => ({
    text: "retreat",
    action: () => {
        if (player.active.single!.canRetreat) {
            player.setPrompt(new Prompt_SelectCard<Card_Pokemon>(
                `Pick a Pokémon to replace ${player.active.single}.`,
                player.bench.cards,
                (card: Card_Pokemon) => {
                    player.active.single!.payRetreatCost();
                    player.active.single!.switch(card);
                    player.game.send(player, "'s", player.active.single, "retreated to the bench.");
                    player.game.send(player, "sent out", card, "!");
                    return true;
                },
                {
                    cancelAction: () => false
                }
            ));
            return true;
        } else {
            player.send(player.active.single, "can't retreat right now.");
            return true;
        }
    }
});
