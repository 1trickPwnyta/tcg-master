import { Client } from "../Client.js";
import { MoveRequest } from "../game/interaction/moves/MoveRequest.js";
import { Player } from "../game/Player.js";

export class Client_HumanSimulator extends Client {
    public send(..._parts: any[]): void { }

    public error(_message: string): void { }

    public requestMove(move: MoveRequest<any>): void {
        throw new Error("Method not implemented.");
    }

    public override copy(player: Player): Client {
        return new Client_HumanSimulator(player);
    }
};
