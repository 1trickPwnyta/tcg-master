import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { Turn } from "../state/Turn.js";
import { SubEngine } from "./SubEngine.js";
import { Choice } from "../state/Choice.js";
import { EnergyCard } from "../state/EnergyCard.js";
import { PokemonCardWrapper } from "../state/PokemonCardWrapper.js";

export class TurnEngine extends SubEngine {
    private get turn(): Turn {
        return this.state.turn!;
    }

    private get mainMenu(): Choice[] {
        const player = this.engine.game.getPlayer(this.turn.player);

        const choices = [
            new Choice({ text: "play a card" }, InterruptResolution.PlayCard),
            new Choice({ text: "attack" }, InterruptResolution.Attack),
            new Choice({ text: "retreat" }, InterruptResolution.Retreat)
        ];

        if (player.pokemonInPlay.some(p => p.def.power?.workers.length)) {
            choices.push(new Choice({ text: "use a Pokémon power" }, InterruptResolution.UsePokemonPower));
        }

        if (player.pokemonInPlay.some(p => p instanceof PokemonCardWrapper)) {
            choices.push(new Choice({ text: "discard trainer card Pokémon" }, InterruptResolution.DiscardWrapper));
        }

        return [ ...choices, new Choice({ text: "end turn" }, InterruptResolution.EndTurn) ];
    }

    public begin(player_id: number) {
        const player = this.engine.game.getPlayer(player_id);
        this.state.turn = {
            number: (this.state.turn?.number ?? 0) + 1,
            player: player.id,
            energyPlayed: false,
            phase: "preattack"
        };
        this.state.betweenTurns = false;
        this.engine.send();
        this.engine.send("Beginning of", this.engine.game.activePlayer, "'s turn.");
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
            this.engine.interrupts.interrupt({
                player: this.turn.player,
                prompt: "Your turn.",
                choices: this.mainMenu,
                force: true
            });
        } else {
            this.end();
            this.engine.game.update();
        }
    }

    public checkActivePokemon(): Interrupt | null {
        const playersWithNoActive = this.state.players.filter(p => !p.activePokemon && p.bench.count);
        if (playersWithNoActive.length) {
            return {
                interrupts: playersWithNoActive.map(p => ({
                    player: p.id,
                    prompt: "Select a Pokémon from your bench to be your active Pokémon.",
                    choices: p.bench.cards.map(c => new Choice(c)),
                    resolution: InterruptResolution.Promote,
                    force: true,
                    args: [ p.id ]
                }))
            };
        } else {
            return null;
        }
    }
};
