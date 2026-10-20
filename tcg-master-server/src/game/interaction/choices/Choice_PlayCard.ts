import { Card } from "../../cards/Card.js";
import { Player } from "../../Player.js";
import { Prompt_SelectCard } from "../prompts/Prompt_SelectCard.js";

export default (player: Player) => ({
    text: "play a card",
        action: () => {
            player.setPrompt(new Prompt_SelectCard(
                "Play which card?",
                player.hand.cards,
                (card: Card) => {
                    card.play();
                    return true;
                },
                {
                    cancelAction: () => false
                }
            ));
            return true;
        }
});
