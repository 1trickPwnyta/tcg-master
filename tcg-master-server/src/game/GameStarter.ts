import { Card_Pokemon } from "./cards/Card_Pokemon.js";
import { Game } from "./Game.js";
import { Prompt } from "./interaction/prompts/Prompt.js";
import { Prompt_SelectCard } from "./interaction/prompts/Prompt_SelectCard.js";
import { Player } from "./Player.js";

export class GameStarter {
    public static startGame(game: Game) {
        const mulligans = new Map<Player, number>();
        game.players.forEach(p => {
            p.send("Welcome!");
            p.deck.shuffle();
            for (let i = 0; i < game.prizes; i++) {
                p.prizes.add(p.deck.draw());
            }
            mulligans.set(p, GameStarter.drawHand(p));
        });
        game.players.forEach(p => {
            const drawsAllowed = mulligans.get(p.opponent);
            if (drawsAllowed) {
                GameStarter.drawAdditional(p, drawsAllowed);
            } else {
                GameStarter.selectActivePokemon(p);
            }
        });
    }

    private static drawHand(p: Player, mulligans: number = 0): number {
        p.draw(7);
        if (p.hand.basicPokemon.length) {
            return mulligans;
        } else {
            p.game.send(p, "has no basic Pokémon in", p.pronoun.possessive, "hand.", p.pronoun.objective.capitalizeFirst(), "must take a mulligan.");
            p.deck.addMany(p.hand.takeAll());
            p.deck.shuffle();
            return GameStarter.drawHand(p, mulligans + 1);
        }
    }

    private static drawAdditional(p: Player, additional: number) {
        p.setPrompt(new Prompt(
            `${p.opponent} had to take ${additional} mulligan(s). Would you like to draw additional cards?`,
            Array.from({ length: additional }, (_, i) => i + 1).map(n => ({
                text: n.toString(),
                action: () => {
                    p.draw(n);
                    GameStarter.selectActivePokemon(p);
                    return true;
                }
            })),
            {
                cancelAction: () => {
                    GameStarter.selectActivePokemon(p);
                    return true;
                }
            }
        ));
    }

    private static selectActivePokemon(p: Player) {
        p.setPrompt(new Prompt_SelectCard<Card_Pokemon>(
            "Select a basic Pokémon as your active Pokémon.",
            p.hand.basicPokemon,
            (card: Card_Pokemon) => {
                p.active.single = card.take() as Card_Pokemon;
                GameStarter.selectBenchPokemon(p);
                return true;
            }
        ));
    }

    private static selectBenchPokemon(p: Player) {
        if (p.hand.basicPokemon.length) {
            p.setPrompt(new Prompt_SelectCard<Card_Pokemon>(
                "Choose other basic Pokémon to put on the bench.",
                p.hand.basicPokemon,
                (card: Card_Pokemon) => {
                    p.bench.add(card.take() as Card_Pokemon);
                    GameStarter.selectBenchPokemon(p);
                    return true;
                },
                {
                    cancelAction: () => true
                }
            ));
        }
    }
};
