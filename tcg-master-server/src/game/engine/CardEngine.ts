import { Client } from "../../Client.js";
import { PokemonCardDef } from "../../defs/PokemonCardDef.js";
import { DefDatabase } from "../../defs/DefDatabase.js";
import { CardState } from "../state/CardState.js";
import { SubEngine } from "./SubEngine.js";

export class CardEngine extends SubEngine {
    public basicPokemonInHand(player_id: number): CardState[] {
        const player = this.engine.players.get(player_id);
        return player.hand.cards.filter(c => {
            const def = DefDatabase.get<PokemonCardDef>(c.def);
            if (def instanceof PokemonCardDef) {
                return def.stage === "basic";
            }
            return false;
        });
    }

    public move(card_id: number, from_id: number, to_id: number) {
        const card = this.engine.search.getCard(card_id)!;
        const owner = this.engine.players.get(card.owner_id)!;
        const from = this.engine.search.getLocation(from_id)!;
        const to = this.engine.search.getLocation(to_id)!;
        if (owner.active.id !== to_id) {
            card.status = [];
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
        const player = this.engine.players.get(player_id);
        for (let i = player.deck.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = player.deck.cards[i];
            player.deck.cards[i] = player.deck.cards[j];
            player.deck.cards[j] = temp;
        }
        this.engine.send(player, "shuffled", player.pronouns.possessive, "deck.");
    }

    public shuffleHandIntoDeck(player_id: number) {
        const player = this.engine.players.get(player_id);
        while (player.hand.cards.length) {
            player.deck.cards.push(player.hand.cards.pop()!);
        }
        this.shuffleDeck(player_id);
    }

    public draw(player_id: number, amount: number = 1) {
        const player = this.engine.players.get(player_id);
        amount = Math.min(amount, player.deck.cards.length);
        const cardsDrawn = [];
        for (let i = 0; i < amount; i++) {
            const card = player.deck.cards.pop()!;
            player.hand.cards.push(card);
            cardsDrawn.push(card);
        }
        if (amount > 5) {
            this.engine.send(player, "drew", amount, `card${amount > 1 ? "s" : ""}.`)
        } else {
            this.engine.sendTo(this.engine.players.getOpponent(player.id).id, player, "drew", amount, `card${amount > 1 ? "s" : ""}.`)
            this.engine.sendTo(player.id, "You drew", ...Client.getCardList(cardsDrawn));
        }
    }

    public takePrize(player_id: number) {
        const player = this.engine.players.get(player_id);
        const card = player.prizes.cards.pop()!;
        player.hand.cards.push(card);
        this.engine.sendTo(this.engine.players.getOpponent(player.id).id, player, "took a prize.");
        this.engine.sendTo(player.id, "You took", card, "as a prize.");
        if (player.prizes.cards.length <= 0) {
            this.engine.end(player_id);
        }
    }
};
