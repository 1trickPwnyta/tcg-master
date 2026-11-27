import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { Interrupt, InterruptAsync, InterruptSync } from "../state/interrupts/Interrupt.js";
import { Turn } from "../state/Turn.js";
import { SubEngine } from "./SubEngine.js";
import { Choice } from "../state/interrupts/Choice.js";
import { EnergyCard } from "../state/EnergyCard.js";
import { PokemonCardWrapper } from "../state/PokemonCardWrapper.js";
import { MenuOption } from "../state/interrupts/MenuOption.js";
import { ClientEventType } from "../../Client.js";

export class TurnEngine extends SubEngine {
    private get turn(): Turn {
        return this.state.turn!;
    }

    private get mainMenu(): Choice[] {
        const player = this.engine.game.getPlayer(this.turn.player);

        const choices = [
            Choice.fromText(MenuOption.PlayCard).withResolution(InterruptResolution.PlayCard),
            Choice.fromText(MenuOption.Attack).withResolution(InterruptResolution.Attack),
            Choice.fromText(MenuOption.Retreat).withResolution(InterruptResolution.Retreat).withAiScoreOffset(-50)
        ];

        if (player.pokemonInPlay.some(p => p.def.power?.workers.length)) {
            choices.push(Choice.fromText(MenuOption.PokemonPower).withResolution(InterruptResolution.UsePokemonPower));
        }

        if (player.pokemonInPlay.some(p => p instanceof PokemonCardWrapper)) {
            choices.push(Choice.fromText(MenuOption.DiscardTrainerPokemon).withResolution(InterruptResolution.DiscardWrapper));
        }

        return [ ...choices, Choice.fromText(MenuOption.EndTurn).withResolution(InterruptResolution.EndTurn).withPriority(-1000) ];
    }

    public begin(player_id: number) {
        const player = this.engine.game.getPlayer(player_id);
        this.state.turn = {
            number: (this.state.turn?.number ?? 0) + 1,
            player: player.id,
            energyPlayed: false,
            retreats: 0,
            cancels: 0,
            phase: "preattack"
        };
        this.state.betweenTurns = false;
        this.engine.send();
        this.engine.send("Beginning of", this.engine.game.activePlayer, "'s turn.");
        this.engine.sendEventTo(this.engine.game.inactivePlayer, {
            type: ClientEventType.Banner,
            args: { message: `${this.engine.game.activePlayer.name}'s turn` }
        });
        this.engine.sendEventTo(this.engine.game.activePlayer, {
            type: ClientEventType.Banner,
            args: { message: "Your turn" }
        });
        player.draw();
        this.engine.game.update();
    }

    public end() {
        this.engine.send("End of", this.engine.game.activePlayer, "'s turn.");
        this.engine.send();
        for (const player of this.state.players) {
            for (const pokemon of player.pokemonInPlay) {
                for (const status of pokemon.modifiers) {
                    status.modifier.notify_endOfTurn({
                        engine: this.engine,
                        owner: player,
                        card: pokemon
                    }, this.state.turn!.player);
                }
                pokemon.evolutionEligible = true;
            }
        }
        for (const client of this.engine.clients) {
            client.notify_endOfTurn();
        }

        // Reset any energy conversions for the turn
        for (const player of this.state.players) {
            for (const pokemon of player.pokemonInPlay) {
                for (const energy of pokemon.attachments.energyCards) {
                    if (energy.card instanceof EnergyCard) {
                        energy.card.clearOverride();
                    } else {
                        const args = pokemon.attachments.getArgs(energy.card.id);
                        if (args?.originalType) {
                            args.type = args.originalType;
                            args.originalType = undefined;
                        }
                    }
                }
            }
        }

        this.state.betweenTurns = true;
        for (const player of this.state.players) {
            for (const pokemon of player.pokemonInPlay) {
                for (const status of pokemon.modifiers) {
                    status.modifier.notify_betweenTurns({
                        engine: this.engine,
                        owner: player,
                        card: pokemon
                    }, status.args);
                }
            }
        }

        const interrupt = this.checkActivePokemon();
        if (interrupt) {
            this.engine.interrupts.interrupt(interrupt);
            return;
        }
    }

    public update() {
        const playerWithNoPokemon = this.state.players.find(p => !p.activePokemon && !p.bench.count);
        if (playerWithNoPokemon) {
            this.engine.end(this.state.players.find(p => p.id !== playerWithNoPokemon.id)!.id);
            return;
        }

        const interrupt = this.checkActivePokemon();
        if (interrupt) {
            this.engine.interrupts.interrupt(interrupt);
            return;
        }

        if (this.turn.phase === "preattack") {
            this.engine.interrupts.interrupt(new InterruptSync(this.state.activePlayer)
                .withPrompt("Your turn.")
                .withChoices(this.mainMenu)
                .forced());
        } else {
            this.end();
            this.engine.game.update();
        }
    }

    public checkActivePokemon(): Interrupt | null {
        const playersWithNoActive = this.state.players.filter(p => !p.activePokemon && p.bench.count);
        if (playersWithNoActive.length) {
            return new InterruptAsync(this.engine, 
                ...playersWithNoActive.map(p => new InterruptSync(p)
                    .withPrompt("Select a Pokémon from your bench to be your active Pokémon.")
                    .withChoices(p.bench.cards.map(c => new Choice(c)))
                    .withResolution(InterruptResolution.Promote)
                    .withArgs(p.id)
                    .forced()
                )
            );
        } else {
            return null;
        }
    }
};
