import { Card } from "../../cards/Card.js";
import { Card_Pokemon } from "../../cards/Card_Pokemon.js";
import { Prompt } from "./Prompt.js";

export class Prompt_SelectCard<T extends Card> extends Prompt {
    public constructor(text: string, cards: T[], action: (card: T) => boolean, options: PromptOptions_SelectCard = {}) {
        const choices = cards.map(c => ({
            text: `${c}${c instanceof Card_Pokemon && c.isActive ? " (active)" : ""}`,
            action: () => action(c)
        }));
        if (options.cancelAction) {
            choices.push({
                text: "(cancel)",
                action: options.cancelAction
            });
        }
        super(text, choices);
    }
};

export type PromptOptions_SelectCard = {
    cancelAction?: () => boolean;
};
