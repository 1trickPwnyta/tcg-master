import $ from "jquery";
import "./global.ts";
import "./text.ts";
import "./commands.ts";
import { UI } from "./ui.ts";
import { Storage } from "./storage.ts";

if (Storage.User) {
    UI.switchToApp($("#main-menu"));
} else {
    $("#hi").fadeTo(500, 1);
    UI.switchToApp($("#intro"), () => {
        setTimeout(() => {
            $("#name-dialog").fadeTo(500, 1, function() { $("#name-input")[0].focus(); });
        }, 1000);
    });
};
