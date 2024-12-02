import { ThenableWebDriver } from "selenium-webdriver";
import { GRASS_EXTENSION_ID } from "../constants";
import { Browser } from "../instance/browser";
import { SignIn_Step } from "./steps/sign-in";
import { Connect_Step } from "./steps/connect";
import { Logger } from "../instance/logger";
import { Proxy_Step } from "./steps/proxy";

export class Executor extends Browser {
    private _driver: ThenableWebDriver;
    public proxyIp: string;
    constructor() {
        super();
    }

    async setup() {
        Logger.info("Creating browser instance");
        const builder = await this.create({
            extensionId: [GRASS_EXTENSION_ID]
        });
        this._driver = builder.build();

        const cdp = await this._driver.createCDPConnection("page");
        if (
            Number(process.env.USE_HTTP_PROXY || "0") === 1 && 
            process.env.HTTP_PROXY_URL && 
            process.env.HTTP_PROXY_USERNAME &&
            process.env.HTTP_PROXY_PASSWORD
        ) {
            await this._driver.register(process.env.HTTP_PROXY_USERNAME, process.env.HTTP_PROXY_PASSWORD, cdp);
        }

        await this._driver.manage().window().maximize();
        await this._driver.manage().deleteAllCookies();

        this.proxyIp = await Proxy_Step(this._driver)

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