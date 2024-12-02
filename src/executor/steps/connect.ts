import { By, ThenableWebDriver, WebElement } from "selenium-webdriver"
import { Browser } from "../../instance/browser"
import { Logger } from "../../instance/logger"
import { delay } from "../../utils"
import { GRASS_EXTENSION_ID } from "../../constants"

export async function Connect_Step(driver: ThenableWebDriver) {
    await driver.get(`chrome-extension://${GRASS_EXTENSION_ID}/index.html`)
    let sleep = 0
    Logger.info('Waiting for connection');
    while (true) {
        try {
            const connectButton: WebElement = await driver.findElement(By.xpath('//button[contains(text(), "CONNECT GRASS")]'));
            await connectButton.click();
            await new Browser().report(driver)
            break;
        } catch {
            await delay(1000);
            sleep += 1
            if (sleep > 30) {
                Logger.warning('Could not connect to the server');
                await new Browser().report(driver)
                break;
            }
        }
    };
    sleep = 0;
    while (true) {
        try {
            await driver.findElement(By.xpath('//*[contains(text(), "Grass is Connected")]'));
            break;
        } catch {
            await delay(1000);
            sleep += 1
            if (sleep > 30) {
                Logger.warning('Something went wrong');
                await new Browser().report(driver)
                return false;
            }
        }
    }
    Logger.success('Session connected');
    return true;
}