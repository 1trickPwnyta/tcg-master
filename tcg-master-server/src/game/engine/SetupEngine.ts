import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { Player } from "../state/Player.js";
import { SubEngine } from "./SubEngine.js";
import { InterruptType } from "../state/interrupts/InterruptType.js";
import { DefDatabase } from "../../defs/DefDatabase.js";
import { PokemonCardDef } from "../../defs/PokemonCardDef.js";
import { EnergyCardDef } from "../../defs/EnergyCardDef.js";
import { TrainerCardDef } from "../../defs/TrainerCardDef.js";
import { CardFactory } from "../CardFactory.js";
import { Choice } from "../state/Choice.js";

export class SetupEngine extends SubEngine {
    public update() {
        if (this.state.players.find(p => p.deck.count === 0)) {
            this.engine.send("Starting game between", this.state.players[0], "and", this.state.players[1], ".");
            for (const player of this.state.players) {
                const deck = [
                    { def: DefDatabase.get<PokemonCardDef>("BaseSet.Farfetchd"), count: 14 },
                    { def: DefDatabase.get<EnergyCardDef>("BaseSet.PsychicEnergy"), count: 26 },
                    { def: DefDatabase.get<TrainerCardDef>("BaseSet.Potion"), count: 10 },
                    { def: DefDatabase.get<EnergyCardDef>("BaseSet.LightningEnergy"), count: 0 },
                    { def: DefDatabase.get<PokemonCardDef>("BaseSet.Haunter"), count: 10 }
                ];
                for (const blueprint of deck) {
                    for (let i = 0; i < blueprint.count; i++) {
                        const card = CardFactory.make(this.engine, blueprint.def, player);
                        player.deck.add(card);
                    }
                }
                player.deck.shuffle();
                player.mulligans = this.setupDraw(player);
            }
            this.engine.game.update();
        } else if (this.state.players.find(p => p.mulligans && !this.state.players.find(o => o.id !== p.id)!.mulliganBonusUsed)) {
            this.engine.interrupts.interrupt({
                interrupts: this.state.players.map((p): Interrupt | undefined => {
                    const opponent = this.state.players.find(o => o.id !== p.id)!;
                    if (opponent.mulligans) {
                        return {
                            player: p.id,
                            prompt: "Will you draw additional cards?",
                            choices: Array.from({ length: opponent.mulligans }, (_, i) => new Choice({ text: (i + 1).toString(), id: i + 1 })),
                            resolution: InterruptResolution.UseMulliganBonus,
                            cancelResolution: InterruptResolution.SkipMulliganBonus,
                            args: [ p.id ]
                        };
                    } else {
                        return undefined;
                    }
                }).filter(i => i !== undefined)
            });
        } else if (this.state.players.find(p => !p.activePokemon)) {
            this.engine.interrupts.interrupt({
                interrupts: this.state.players.map(p => ({
                    type: InterruptType.SelectActive,
                    player: p.id,
                    prompt: "Select a basic Pokémon as your active Pokémon.",
                    choices: p.hand.basicPokemon.map(c => new Choice(c)),
                    resolution: InterruptResolution.MoveCard,
                    args: [ p.hand.id, p.active.id ],
                    force: true
                }))
            });
        } else {
            const playersNotReady = this.state.players.filter(p => !p.setupComplete && p.hand.basicPokemon.length && !p.bench.full);
            if (playersNotReady.length) {
                this.engine.interrupts.interrupt({
                    interrupts: playersNotReady.map(p => ({
                        type: InterruptType.Bench,
                        player: p.id,
                        prompt: "Choose other basic Pokémon to put on the bench.",
                        choices: p.hand.basicPokemon.map(c => new Choice(c)),
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
                const firstPlayer = this.engine.game.flipCoin() ? this.state.players[0] : this.state.players[1];
                this.engine.send(firstPlayer, "will go first.");
                this.engine.send();
                this.engine.turns.begin(firstPlayer.id);
            }
        }
    }

    private setupDraw(player: Player, mulligans: number = 0): number {
        player.draw(7);
        if (player.hand.basicPokemon.length) {
            return mulligans;
        } else {
            this.engine.send(player, "has no basic Pokémon in", player.pronouns.possessive, "hand.", player.pronouns.subjective.capitalizeFirst(), "must take a mulligan.");
            player.hand.shuffleIntoDeck();
            return this.setupDraw(player, mulligans + 1);
        }
    }
};
