import $ from "jquery";
import { Input } from "./input";

const list = {
    "You": [
        [ "Active Pokémon", "check active" ],
        [ "Bench", "check bench" ],
        [ "Hand", "check hand" ],
        [ "Discard pile", "check discard" ]
    ],
    "Opponent": [
        [ "Active Pokémon", "check xactive" ],
        [ "Bench", "check xbench" ],
        [ "Discard pile", "check xdiscard" ]
    ]
};

function execute(command: string) {
    Input.send(command);
    $("#input")[0].focus();
}

const you = $("#commands-you div");
for (const item of list["You"]) {
    you.append($("<button>", {
        text: item[0],
        click: () => execute(item[1])
    }));
}

const opponent = $("#commands-opponent div");
for (const item of list["Opponent"]) {
    opponent.append($("<button>", {
        text: item[0],
        click: () => execute(item[1])
    }));
}
