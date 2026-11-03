import { CardDatabase } from "../cards/CardDatabase.js";
import { CardWorker } from "../cards/workers/CardWorker.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { CardState } from "../state/CardState.js";
import { Interrupt } from "../state/Interrupt.js";
import { PlayerState } from "../state/PlayerState.js";
import { GameWorker } from "./GameWorker.js";

export class GameWorker_Setup extends GameWorker {
    private nextCardId: number = 100;

    public update() {
        if (this.state.players.find(p => p.deck.cards.length === 0)) {
            this.game.send("Starting game between", this.state.players[0], "and", this.state.players[1], ".");
            for (const player of this.state.players) {
                const deck = [
                    { card: CardDatabase.find("BaseSet.Ninetales"), count: 8 },
                    { card: CardDatabase.find("BaseSet.Vulpix"), count: 12 },
                    { card: CardDatabase.find("BaseSet.FireEnergy"), count: 20 },
                    { card: CardDatabase.find("BaseSet.Switch"), count: 10 },
                    { card: CardDatabase.find("BaseSet.Potion"), count: 10 }
                ];
                for (const blueprint of deck) {
                    for (let i = 0; i < blueprint.count; i++) {
                        const card = this.makeCard(blueprint.card, player);
                        player.deck.cards.push(card);
                    }
                }
                this.game.cards.shuffleDeck(player.id);
                player.mulligans = this.setupDraw(player);
            }
            this.game.update();
        } else if (this.state.players.find(p => p.mulligans && !this.state.players.find(o => o.id !== p.id)!.mulliganBonusUsed)) {
            this.game.interrupts.interrupt({
                interrupts: this.state.players.map((p): Interrupt | undefined => {
                    const opponent = this.state.players.find(o => o.id !== p.id)!;
                    if (opponent.mulligans) {
                        return {
                            player: p.id,
                            prompt: "Will you draw additional cards?",
                            choices: Array.from({ length: opponent.mulligans }, (_, i) => ({ text: (i + 1).toString(), target_id: i + 1 })),
                            resolution: InterruptResolution.UseMulliganBonus,
                            cancelResolution: InterruptResolution.SkipMulliganBonus,
                            args: [ p.id ]
                        };
                    } else {
                        return undefined;
                    }
                }).filter(i => i !== undefined)
            });
        } else if (this.state.players.find(p => !p.active.cards.length)) {
            this.game.interrupts.interrupt({
                interrupts: this.state.players.map(p => ({
                    player: p.id,
                    prompt: "Select a basic Pokémon as your active Pokémon.",
                    choices: this.game.cards.basicPokemonInHand(p.id).map(c => ({ text: c.name, target_id: c.id })),
                    resolution: InterruptResolution.MoveCard,
                    args: [ p.hand.id, p.active.id ],
                    force: true
                }))
            });
        } else {
            const playersNotReady = this.state.players.filter(p => !p.setupComplete && this.game.cards.basicPokemonInHand(p.id).length && p.bench.cards.length < 5);
            if (playersNotReady.length) {
                this.game.interrupts.interrupt({
                    interrupts: playersNotReady.map(p => ({
                        player: p.id,
                        prompt: "Choose other basic Pokémon to put on the bench.",
                        choices: this.game.cards.basicPokemonInHand(p.id).map(c => ({ text: c.name, target_id: c.id })),
                        resolution: InterruptResolution.MoveCard,
                        cancelResolution: InterruptResolution.SkipBench,
                        args: [ p.hand.id, p.bench.id ]
                    }))
                });
            } else {
                for (const player of this.state.players) {
                    for (let i = 0; i < this.state.rules.prizes; i++) {
                        player.prizes.cards.push(player.deck.cards.pop()!);
                    }
                }
                const firstPlayer = this.game.flipCoin() ? this.state.players[0] : this.state.players[1];
                this.game.send(firstPlayer, "will go first.");
                this.game.send();
                this.game.turns.begin(firstPlayer.id);
            }
        }
    }

    private setupDraw(player: PlayerState, mulligans: number = 0): number {
        this.game.cards.draw(player.id, 7);
        if (this.game.cards.basicPokemonInHand(player.id).length) {
            return mulligans;
        } else {
            this.game.send(player, "has no basic Pokémon in", player.pronouns.possessive, "hand.", player.pronouns.subjective.capitalizeFirst(), "must take a mulligan.");
            this.game.cards.shuffleHandIntoDeck(player.id);
            return this.setupDraw(player, mulligans + 1);
        }
    }

    private makeCard(worker: CardWorker, owner: PlayerState): CardState {
        return {
            id: this.nextCardId++,
            dbid: worker.dbid,
            kind: worker.kind,
            token: worker.token,
            name: worker.name,
            owner_id: owner.id,
            damage: 0,
            poison: false,
            orientation: "normal",
            attachments: { id: this.nextCardId++, cards: [] }
        };
    }
};
