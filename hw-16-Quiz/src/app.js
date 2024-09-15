import {Router} from "./router.js";

class App {
    constructor() {
        this.router = new Router();
        window.addEventListener('DOMContentLoaded',
            this.handleRouterChanging.bind(this)
        )
        window.addEventListener('popstate',
            this.handleRouterChanging.bind(this)
        )
    }

    handleRouterChanging() {
        this.router.openRoute();
    }
}

(new App());