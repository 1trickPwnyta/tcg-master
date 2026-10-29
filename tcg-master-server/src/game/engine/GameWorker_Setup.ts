import { CardDatabase } from "../cards/CardDatabase.js";
import { CardWorker } from "../cards/CardWorker.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { CardState } from "../state/CardState.js";
import { Interrupt } from "../state/Interrupt.js";
import { PlayerState } from "../state/PlayerState.js";
import { GameWorker } from "./GameWorker.js";

export class GameWorker_Setup extends GameWorker {
    public update(callback?: () => void) {
        if (this.state.players.find(p => p.deck.cards.length === 0)) {
            this.game.send("Starting game between", this.state.players[0], "and", this.state.players[1], ".");
            for (const player of this.state.players) {
                const deck = [
                    { card: CardDatabase.find("BaseSet.Voltorb"), count: 30 },
                    { card: CardDatabase.find("BaseSet.LightningEnergy"), count: 30 }
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
            this.game.update(callback);
        } else if (this.state.players.find(p => p.mulligans && !this.state.players.find(o => o.id !== p.id)!.mulliganBonusUsed)) {
            this.game.interrupt({
                interrupts: this.state.players.map((p): Interrupt | undefined => {
                    const opponent = this.state.players.find(o => o.id !== p.id)!;
                    if (opponent.mulligans) {
                        return {
                            player: p.id,
                            prompt: "Will you draw additional cards?",
                            choices: Array.from({ length: opponent.mulligans }, (_, i) => ({ text: (i + 1).toString(), target_id: (i + 1).toString() })),
                            resolution: InterruptResolution.UseMulliganBonus,
                            cancelResolution: InterruptResolution.SkipMulliganBonus,
                            args: [ p.id ]
                        };
                    } else {
                        return undefined;
                    }
                }).filter(i => i !== undefined)
            }, callback);
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
            }, callback);
        } else {
            const playersNotReady = this.state.players.filter(p => !p.setupComplete && this.game.basicPokemonInHand(p.id).length && p.bench.cards.length < 5);
            if (playersNotReady.length) {
                this.game.interrupt({
                    interrupts: playersNotReady.map(p => ({
                        player: p.id,
                        prompt: "Choose other basic Pokémon to put on the bench.",
                        choices: this.game.basicPokemonInHand(p.id).map(c => ({ text: c.name, target_id: c.id })),
                        resolution: InterruptResolution.MoveCard,
                        cancelResolution: InterruptResolution.SkipBench,
                        args: [ p.hand.id, p.bench.id ]
                    }))
                }, callback);
            } else {
                for (const player of this.state.players) {
                    for (let i = 0; i < this.state.rules.prizes; i++) {
                        player.prizes.cards.push(player.deck.cards.pop()!);
                    }
                }
                const firstPlayer = this.game.flipCoin() ? this.state.players[0] : this.state.players[1];
                this.game.send(firstPlayer, "will go first.");
                this.game.send();
                this.game.beginTurn(firstPlayer.id);
                this.game.update(callback);
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
            attachments: { id: crypto.randomUUID(), name: `${worker.name}'s attachments`, cards: [] }
        };
    }
};
