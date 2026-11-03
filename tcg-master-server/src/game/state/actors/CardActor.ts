import { Client } from "../../../Client.js";
import { CardDatabase } from "../../cards/CardDatabase.js";
import { CardWorker_Pokemon } from "../../cards/workers/CardWorker_Pokemon.js";
import { CardState } from "../CardState.js";
import { StateActor } from "./StateActor.js";

export class CardActor extends StateActor {
    public basicPokemonInHand(player_id: number): CardState[] {
        const player = this.game.players.get(player_id);
        return player.hand.cards.filter(c => {
            const worker = CardDatabase.find(c.dbid)
            if (worker instanceof CardWorker_Pokemon) {
                return worker.stage === "basic";
            }
            return false;
        });
    }

    public move(card_id: number, from_id: number, to_id: number) {
        const card = this.game.search.getCard(card_id)!;
        const owner = this.game.players.get(card.owner_id)!;
        const from = this.game.search.getLocation(from_id)!;
        const to = this.game.search.getLocation(to_id)!;
        if (owner.active.id !== to_id) {
            card.orientation = "normal";
            card.poison = false;
        }
        if (owner.active.id !== to_id && owner.bench.id !== to_id) {
            card.damage = 0;
            for (const attachment of card.attachments.cards) {
                this.move(attachment.id, card.attachments.id, owner.discard.id);
            }
        }
        from.cards.splice(from.cards.indexOf(card), 1);
        to.cards.push(card);
    }

    public shuffleDeck(player_id: number) {
        const player = this.game.players.get(player_id);
        for (let i = player.deck.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = player.deck.cards[i];
            player.deck.cards[i] = player.deck.cards[j];
            player.deck.cards[j] = temp;
        }
        this.game.send(player, "shuffled", player.pronouns.possessive, "deck.");
    }

    public shuffleHandIntoDeck(player_id: number) {
        const player = this.game.players.get(player_id);
        while (player.hand.cards.length) {
            player.deck.cards.push(player.hand.cards.pop()!);
        }
        this.shuffleDeck(player_id);
    }

    public draw(player_id: number, amount: number = 1) {
        const player = this.game.players.get(player_id);
        amount = Math.min(amount, player.deck.cards.length);
        const cardsDrawn = [];
        for (let i = 0; i < amount; i++) {
            const card = player.deck.cards.pop()!;
            player.hand.cards.push(card);
            cardsDrawn.push(card);
        }
        if (amount > 5) {
            this.game.send(player, "drew", amount, `card${amount > 1 ? "s" : ""}.`)
        } else {
            this.game.sendTo(this.game.players.getOpponent(player.id).id, player, "drew", amount, `card${amount > 1 ? "s" : ""}.`)
            this.game.sendTo(player.id, "You drew", ...Client.getCardList(cardsDrawn));
        }
    }

    public takePrize(player_id: number) {
        const player = this.game.players.get(player_id);
        const card = player.prizes.cards.pop()!;
        player.hand.cards.push(card);
        this.game.sendTo(this.game.players.getOpponent(player.id).id, player, "took a prize.");
        this.game.sendTo(player.id, "You took", card, "as a prize.");
        if (player.prizes.cards.length <= 0) {
            this.game.end(player_id);
        }
    }
};
