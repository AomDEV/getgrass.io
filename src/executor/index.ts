import { ThenableWebDriver } from "selenium-webdriver";
import { GRASS_EXTENSION_ID } from "../constants";
import { Browser } from "../instance/browser";
import { SignIn_Step } from "./steps/sign-in";
import { Connect_Step } from "./steps/connect";
import { Logger } from "../instance/logger";

export class Executor extends Browser {
    private _driver: ThenableWebDriver;
    constructor() {
        super();
    }

    async setup() {
        Logger.info("Creating browser instance");
        const builder = await this.create({
            extensionId: [GRASS_EXTENSION_ID]
        });
        this._driver = builder.build();

        await this._driver.manage().window().maximize();
        await this._driver.manage().deleteAllCookies();

        const steps = [
            () => SignIn_Step(this._driver),
            () => Connect_Step(this._driver),
        ];
        for (const step of steps) {
            const result = await step();
            if (result) continue;

            await this._driver.quit();
            return null;
        }
        return this._driver;
    }
}