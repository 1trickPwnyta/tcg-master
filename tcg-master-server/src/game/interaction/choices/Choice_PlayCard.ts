import { Card } from "../../cards/Card.js";
import { Player } from "../../Player.js";
import { Prompt_SelectCard } from "../prompts/Prompt_SelectCard.js";

function selectCard(player: Player) {
    player.setPrompt(new Prompt_SelectCard(
        "Play which card?",
        player.hand.cards,
        (card: Card) => {
            if (!card.unplayableReason) {
                card.play();
                return true;
            } else {
                player.send(card.unplayableReason);
                selectCard(player);
                return true;
            }
        },
        {
            cancelAction: () => true
        }
    ));
}

export default (player: Player) => ({
    text: "play a card",
        action: () => {
            selectCard(player);
            return true;
        }
});
