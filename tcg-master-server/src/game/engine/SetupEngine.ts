import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { Interrupt, InterruptAsync, InterruptSync } from "../state/interrupts/Interrupt.js";
import { Player } from "../state/Player.js";
import { SubEngine } from "./SubEngine.js";
import { InterruptType } from "../state/interrupts/InterruptType.js";
import { DefDatabase } from "../../defs/DefDatabase.js";
import { PokemonCardDef } from "../../defs/PokemonCardDef.js";
import { EnergyCardDef } from "../../defs/EnergyCardDef.js";
import { TrainerCardDef } from "../../defs/TrainerCardDef.js";
import { CardFactory } from "../CardFactory.js";
import { Choice } from "../state/interrupts/Choice.js";
import { PokemonCard } from "../state/PokemonCard.js";

export class SetupEngine extends SubEngine {
    public update() {
        if (this.state.players.find(p => p.deck.count === 0)) {
            this.engine.send("Starting game between", this.state.players[0], "and", this.state.players[1], ".");
            const deck1 = [
                { def: DefDatabase.get<PokemonCardDef>("BaseSet.Poliwag"), count: 0 },
                { def: DefDatabase.get<PokemonCardDef>("BaseSet.Poliwhirl"), count: 0 },
                { def: DefDatabase.get<PokemonCardDef>("BaseSet.Magikarp"), count: 36 },
                { def: DefDatabase.get<EnergyCardDef>("BaseSet.WaterEnergy"), count: 24 },
                { def: DefDatabase.get<EnergyCardDef>("BaseSet.DoubleColorlessEnergy"), count: 0 },
                { def: DefDatabase.get<PokemonCardDef>("BaseSet.Bill"), count: 0 }
            ];
            const deck2 = [
                { def: DefDatabase.get<EnergyCardDef>("BaseSet.PsychicEnergy"), count: 30 },
                { def: DefDatabase.get<TrainerCardDef>("BaseSet.Doduo"), count: 30 }
            ];
            for (const blueprint of deck1) {
                for (let i = 0; i < blueprint.count; i++) {
                    const card = CardFactory.make(this.engine, blueprint.def, this.state.players[0]);
                    this.state.players[0].deck.add(card);
                }
            }
            for (const blueprint of deck2) {
                for (let i = 0; i < blueprint.count; i++) {
                    const card = CardFactory.make(this.engine, blueprint.def, this.state.players[1]);
                    this.state.players[1].deck.add(card);
                }
            }
            for (const player of this.state.players) {
                player.deck.shuffle();
                const mulligans = this.setupDraw(player);
                if (mulligans !== null) {
                    player.mulligans = mulligans;
                }
            }
            this.engine.game.update();
        } else if (this.state.players.find(p => p.mulligans && !p.opponent.mulliganBonusUsed)) {
            this.engine.interrupts.interrupt(new InterruptAsync(this.engine, 
                ...this.state.players.map((p): Interrupt | undefined => {
                    const opponent = this.state.players.find(o => o.id !== p.id)!;
                    if (opponent.mulligans) {
                        return new InterruptSync(p)
                            .withPrompt("Will you draw additional cards?")
                            .withChoices(Array.from({ length: opponent.mulligans }, (_, i) => Choice.fromInt(i + 1)))
                            .withResolution(InterruptResolution.UseMulliganBonus)
                            .withCancelResolution(InterruptResolution.SkipMulliganBonus)
                            .withArgs(p.id);
                    } else {
                        return undefined;
                    }
                }).filter(i => i !== undefined)
            ));
        } else if (this.state.players.find(p => !p.activePokemon)) {
            this.engine.interrupts.interrupt(new InterruptAsync(this.engine,
                ...this.state.players.map(p => new InterruptSync(p)
                    .ofType(InterruptType.SelectActive)
                    .withPrompt("Select a basic Pokémon as your active Pokémon.")
                    .withChoices(p.hand.basicPokemon.map(c => new Choice(c)))
                    .withResolution(InterruptResolution.MoveCard)
                    .withArgs(p.hand.id, p.active.id)
                    .forced())));
        } else {
            const playersNotReady = this.state.players.filter(p => !p.setupComplete && p.hand.basicPokemon.length && !p.bench.full);
            if (playersNotReady.length) {
                this.engine.interrupts.interrupt(new InterruptAsync(this.engine,
                    ...playersNotReady.map(p => new InterruptSync(p)
                        .ofType(InterruptType.Bench)
                        .withPrompt("Choose other basic Pokémon to put on the bench.")
                        .withChoices(p.hand.basicPokemon.map(c => new Choice(c)))
                        .withResolution(InterruptResolution.MoveCard)
                        .withCancelResolution(InterruptResolution.SkipBench)
                        .withArgs(p.hand.id, p.bench.id))));
            } else {
                for (const player of this.state.players) {
                    for (let i = 0; i < this.state.rules.prizes; i++) {
                        player.prizes.cards.push(player.deck.cards.pop()!);
                    }
                }
                this.state.started = true;
                this.engine.sendSync();
                const firstPlayer = this.engine.game.flipCoin() ? this.state.players[0] : this.state.players[1];
                this.engine.send(firstPlayer, "will go first.");
                this.engine.send();
                this.engine.turns.begin(firstPlayer.id);
            }
        }
    }

    public setupDraw(player: Player, mulligans: number = 0): number | null {
        player.draw(7);
        if (player.hand.basicPokemon.length) {
            if (!player.hand.cards.some(c => c instanceof PokemonCard)) {
                this.engine.interrupts.interrupt(new InterruptSync(player)
                    .withPrompt("The only basic Pokémon in your hand are Trainer cards. Do you want to take a mulligan?")
                    .withChoices([ Choice.Yes, Choice.No ])
                    .withResolution(InterruptResolution.OptionalMulligan)
                    .withArgs(player.id, mulligans)
                    .forced());
                return null;
            }
            return mulligans;
        } else {
            player.hand.reveal();
            this.engine.send(player, "has no basic Pokémon in", player.pronouns.possessive, "hand.", player.pronouns.subjective.capitalizeFirst(), "must take a mulligan.");
            player.hand.shuffleIntoDeck();
            return this.setupDraw(player, mulligans + 1);
        }
    }
};
