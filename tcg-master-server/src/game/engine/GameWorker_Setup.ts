import { Card_Energy_BaseSet_LightningEnergy } from "../cards/BaseSet/Card_Energy_BaseSet_LightningEnergy.js";
import { Card_Pokemon_BaseSet_Voltorb } from "../cards/BaseSet/Card_Pokemon_BaseSet_Voltorb.js";
import { CardDatabase } from "../cards/CardDatabase.js";
import { CardWorker } from "../cards/CardWorker.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { CardState } from "../state/CardState.js";
import { PlayerState } from "../state/PlayerState.js";
import { GameWorker } from "./GameWorker.js";

export class GameWorker_Setup extends GameWorker {
    public update() {
        if (this.state.players.find(p => p.deck.cards.length === 0)) {
            this.game.send("Starting game between", this.state.players[0], "and", this.state.players[1], ".");
            for (const player of this.state.players) {
                const deck = [
                    { card: CardDatabase.find(Card_Pokemon_BaseSet_Voltorb), count: 30 },
                    { card: CardDatabase.find(Card_Energy_BaseSet_LightningEnergy), count: 30 }
                ];
                for (const blueprint of deck) {
                    for (let i = 0; i < blueprint.count; i++) {
                        const card = this.makeCard(blueprint.card);
                        player.deck.cards.push(card);
                    }
                }
                this.game.shuffleDeck(player.id);
                player.mulligans = this.setupDraw(player);
            }
            this.game.update();
        } else if (this.state.players.find(p => p.mulligans && !this.state.players.find(o => o.id !== p.id)!.mulliganBonusUsed)) {

        } else if (this.state.players.find(p => !p.active.cards.length)) {
            this.game.interrupt({
                interrupts: this.state.players.map(p => ({
                    player: p.id,
                    prompt: "Select a basic Pokémon as your active Pokémon.",
                    choices: this.game.basicPokemonInHand(p.id).map(c => ({ text: c.name, target_id: c.id })),
                    resolution: InterruptResolution.MoveCard,
                    args: [ p.hand.id, p.active.id ],
                    force: true
                }))
            });
        } else {
            const playersNotReady = this.state.players.filter(p => !p.setupComplete && this.game.basicPokemonInHand(p.id).length && p.bench.cards.length < 5);
            if (playersNotReady.length) {
                this.game.interrupt({
                    interrupts: playersNotReady.map(p => ({
                        player: p.id,
                        prompt: "Choose other basic Pokémon to put on the bench.",
                        choices: this.game.basicPokemonInHand(p.id).map(c => ({ text: c.name, target_id: c.id })),
                        resolution: InterruptResolution.MoveCard,
                        cancelResolution: InterruptResolution.CompleteSetup,
                        args: [ p.hand.id, p.bench.id ]
                    }))
                });
            } else {
                const firstPlayer = this.game.flipCoin() ? this.state.players[0] : this.state.players[1];
                this.game.send(firstPlayer, "will go first.");
                this.game.send();
                this.game.beginTurn(firstPlayer.id);
                this.game.update();
            }
        }
    }

    private setupDraw(player: PlayerState, mulligans: number = 0): number {
        this.game.draw(player.id, 7);
        if (this.game.basicPokemonInHand(player.id).length) {
            return mulligans;
        } else {
            this.game.send(player, "has no basic Pokémon in", player.pronouns.possessive, "hand.", player.pronouns.subjective.capitalizeFirst(), "must take a mulligan.");
            this.game.shuffleHandIntoDeck(player.id);
            return this.setupDraw(player, mulligans + 1);
        }
    }

    private makeCard(worker: CardWorker): CardState {
        return {
            id: crypto.randomUUID(),
            dbid: worker.dbid,
            token: worker.token,
            name: worker.name,
            damage: 0,
            poison: false,
            orientation: "normal",
            attachments: { id: crypto.randomUUID(), cards: [] }
        };
    }
};
