import $ from "jquery";

export class UI {
    private static currentApp: JQuery<HTMLElement>;

    public static switchToApp(app: JQuery<HTMLElement>, callback?: () => void) {
        if (UI.currentApp) {
            UI.currentApp.fadeOut(500);
        }
        UI.currentApp = app;
        app.css({ display: "inherit", opacity: 0 });
        app.fadeTo(500, 1, callback);
    }

    public static setWaitMessage(message: string) {
        $("#wait-message").text(message);
    }
};
