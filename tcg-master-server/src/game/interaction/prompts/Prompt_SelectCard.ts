import { Card } from "../../cards/Card.js";
import { Card_Pokemon } from "../../cards/Card_Pokemon.js";
import { Prompt, PromptOptions } from "./Prompt.js";

export class Prompt_SelectCard<T extends Card> extends Prompt {
    public constructor(text: string, cards: T[], action: (card: T) => boolean, options: PromptOptions = {}) {
        const choices = cards.map(c => ({
            text: `${c}${c instanceof Card_Pokemon && c.isActive ? " (active)" : ""}`,
            action: () => action(c)
        }));
        super(text, choices, options);
    }
};
