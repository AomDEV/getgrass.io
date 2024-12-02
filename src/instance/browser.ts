import chrome from "selenium-webdriver/chrome"
import { Builder, logging, ThenableWebDriver } from "selenium-webdriver";
import { join } from "path";
import { mkdir, writeFile } from "fs/promises";
import querystring from "querystring"
import { createWriteStream, existsSync, mkdirSync } from "fs";
import { Logger } from "./logger";
import axios from "axios";

export class Browser {
    private readonly EXTENSION_BASE_URL = "https://clients2.google.com/service/update2/crx";

    constructor() { }

    private _getPath(folder: string, fileName?: string) {
        const output = join(__dirname, '..', folder);
        if (!existsSync(output)) mkdirSync(output);
        if (fileName) return join(output, fileName);
        return output;
    }

    protected async create(config: {
        readonly extensionId?: string[];
        readonly noHeadless?: boolean;
        readonly sandbox?: boolean;
    } = {}) {
        const options = new chrome.Options();
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--disable-gpu");
        if (!config.noHeadless) options.addArguments("--headless=new");
        if (!config.sandbox) options.addArguments("--no-sandbox");
        if (Number(process.env.USE_HTTP_PROXY || "0") === 1 && process.env.HTTP_PROXY_URL)
            options.addArguments(`--proxy-server=${process.env.HTTP_PROXY_URL}`);

        if (config.extensionId && Array.isArray(config.extensionId) && config.extensionId.length > 0) {
            Logger.info(`Downloading ${config.extensionId.length} extensions`);
            const extensionPaths = await Promise.all(config.extensionId.map(extId => this.download(extId)))
            options.addExtensions(...extensionPaths);
        }

        const builder = new Builder().forBrowser("chrome").setChromeOptions(options);

        return builder;
    }

    protected async getCapabilities() {
        Logger.info("Creating browser capabilities");
        const builder = await this.create();
        const driver = builder.build();
        const capabilities = await driver.getCapabilities();
        await driver.close();
        return capabilities;
    }

    protected async getExtensionURI(extensionId: string) {
        const capabilities = await this.getCapabilities();
        const queries = {
            "response": "redirect",
            "prodversion": capabilities.getBrowserVersion(),
            "acceptformat": ["crx2", "crx3"].join(','),
            "x": `id=${extensionId}&uc`
        };
        return new URL(`?${querystring.stringify(queries)}`, this.EXTENSION_BASE_URL)
    }

    public async report(builder: ThenableWebDriver) {
        const logId = `${String(new Date().getTime())}_${String(Math.floor(Math.random() * 1000000)).padStart(7, '0')}`;
        const output = this._getPath(".log");
        await mkdir(join(output, logId));

        const dataUri = await builder.takeScreenshot();
        writeFile(join(output, logId, `screenshot.png`), Buffer.from(dataUri, 'base64'), 'base64');

        const logs = await builder.manage().logs().get(logging.Type.BROWSER)
        writeFile(join(output, logId, `logs.txt`), logs.map(log => `[${log.timestamp}][${log.level}][${log.type}] ${log.message}`).join('\n'));
    }

    async download(extensionId: string) {
        const uri = await this.getExtensionURI(extensionId);
        const path = this._getPath('.dl', `${extensionId}.crx`);
        const writer = createWriteStream(path);

        Logger.info(`Downloading Chrome extension (ID: ${extensionId})`);
        return axios.request({
            url: uri.toString(),
            responseType: 'stream',
        }).then(response => {
            return new Promise<string>((resolve, reject) => {
                response.data.pipe(writer);
                let error = null;
                writer.on('error', err => {
                    error = err;
                    writer.close();
                    reject(err);
                });
                writer.on('close', () => {
                    if (error) return;
                    resolve(path);
                });
            });
        });
    }
}