export class Storage {
    public static get User(): { name: string } | undefined {
        if (localStorage.user) {
            return JSON.parse(localStorage.user);
        } else {
            return undefined;
        }
    }

    public static set User(user: { name: string }) {
        localStorage.user = JSON.stringify(user);
    }
};
