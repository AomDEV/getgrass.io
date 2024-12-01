import express from "express";
import { Logger } from "./instance/logger";
import { By, WebDriver } from "selenium-webdriver";
import axios from "axios";

export class Router {
    serve(
        driver: WebDriver
    ) {
        if (!driver) return Logger.warning('No connection found')
        const app = express();
        const port = process.env.PORT || 3030;
        const startTime = new Date().getTime();
        app.get('/', async (req, res) => {
            const earningElement = await driver.findElement(By.xpath('//*[@id="root"]/div/div/main/div/div[1]/div[1]/div[2]/div/p')).then((elem) => elem.getText());
            const qualityElement = await driver.findElement(By.xpath('//*[@id="root"]/div/div/main/div/div[1]/div[3]/div/div/div/p[2]')).then((elem) => elem.getText());

            const earning = Number(earningElement);
            const quality = Number(qualityElement.split('%')[0]);

            const origin = await axios.get(`https://httpbin.co/ip`).catch(() => null);
            res.json({
                earning,
                quality,
                uptime: (new Date().getTime() - startTime) / 1000 / 60,
                origin: origin?.data?.origin,
            });
        });

        app.listen(port, () => {
            return Logger.success("Application is listening on port", port);
        });
    }
}