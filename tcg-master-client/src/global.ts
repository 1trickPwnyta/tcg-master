import $ from "jquery";
import { Gameplay } from "./gameplay";
import { UI } from "./ui";
import { Storage } from "./storage";

declare global {
    var submitName: (e: Event) => void;
    var newGameCom: () => void;
    var newGameHuman: () => void;
    var formSubmit: (e: Event) => void;
}

globalThis.submitName = (e: Event) => {
    e.preventDefault();
    const input = $("#name-input");
    const name = input.val() as string;
    const user = {
        name: name
    };
    Storage.User = user;
    $("#name-dialog").css("opacity", 0);
    $("#hi").fadeTo(500, 0);
    $("#thanks").fadeTo(500, 1, function() { setTimeout(() => UI.switchToApp($("#main-menu")), 1000) });
};

globalThis.newGameCom = () => {
    Gameplay.startVsCom();
};

globalThis.newGameHuman = () => {
    Gameplay.startVsHuman();
};

globalThis.formSubmit = (e: Event) => {
    e.preventDefault();
    const form = $("#input-form");
    const input = form.find("input[type=\"text\"]").val() as string;
    form.trigger("reset");
    Gameplay.instance.send(input.trim());
};