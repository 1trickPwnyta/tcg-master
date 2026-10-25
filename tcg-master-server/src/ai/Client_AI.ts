import { Client } from "../Client.js";
import { InvalidSelectionError, Prompt } from "../game/interaction/prompts/Prompt.js";
import { Player } from "../game/Player.js";
import { AIEvaluator } from "./AIEvaluator.js";
import { AIPlanner } from "./AIPlanner.js";

export class Client_AI extends Client {
    private evaluator: AIEvaluator = new AIEvaluator(this.player);
    private planner: AIPlanner | null = null;
    private choiceQueue: string[] = [];

    public send(...parts: any[]): void {
        console.log(`${this.player} received a message: ${parts.join(" ")}`);
    }

    public error(message: string): void {
        console.error(`${this.player} received an error: ${message}`);
    }

    public sendPrompt(prompt: Prompt | null): void {
        if (prompt?.choices?.length) {
            console.log(`${this.player} received a prompt with ${prompt.choices.length} choice(s): ${prompt.text}`);
            
            if (this.planner?.nextChoice) {
                const choice = this.planner.nextChoice;
                this.planner.nextChoice = null;
                this.planner.choice = choice;
                prompt.respond(choice);
                if (!this.planner.nullified) {
                    const score = this.evaluator.evaluate();
                    this.planner.recordScore(score);
                }
            } else if (this.choiceQueue.length) {
                const choice = this.choiceQueue.splice(0, 1)[0];
                prompt.respond(choice);
            } else {
                if (!this.game.planningMode) {
                    AIPlanner.reset();
                }
                
                for (const c of prompt.choices) {
                    console.log("Being choice " + c.key);
                    const game = this.player.game.copy();
                    const client = game.players.find(p => p.client instanceof Client_AI && p.name == this.player.name)!.client as Client_AI;
                    let previousChoices: string[] = [];
                    if (this.planner?.choice) {
                        previousChoices = [ ...this.planner.previousChoices, this.planner.choice ];
                        this.planner.nullified = true;
                    }
                    client.planner = new AIPlanner(c.key!, previousChoices);
                    game.update();
                    console.log("End choice " + c.key);
                };

                if (!this.game.planningMode) {
                    this.choiceQueue = AIPlanner.getBestChoices();
                }
            }
            
            /*const option = Math.floor(Math.random() * (prompt.choices.length ?? 0));
            console.log(`${this.player} responds: ${option + 1}`);
            try {
                prompt.respond(prompt.choices[option].key!);
            } catch (e) {
                if (e instanceof InvalidSelectionError) {
                    console.error(`${this.player} selected an invalid option: ${prompt.choices[option]?.text ?? option}`);
                } else {
                    throw e;
                }
            }*/
        }
    }

    public override copy(player: Player): Client {
        return new Client_AI(player);
    }
};
