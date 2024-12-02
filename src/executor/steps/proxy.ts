import { By, ThenableWebDriver } from "selenium-webdriver";
import { Logger } from "../../instance/logger";
import { Browser } from "../../instance/browser";

export async function Proxy_Step(driver: ThenableWebDriver) {
    try {
        Logger.info("Getting ip address");
        await driver.get("https://httpbin.co/ip");
        const response = await driver.findElement(By.xpath(`//pre`)).then((elem) => elem.getText());
        const { origin: proxyIp } = JSON.parse(response) as { origin: string };
        Logger.success("Proxy IP address:", proxyIp);
        return proxyIp;
    } catch (e) {
        await new Browser().report(driver);
        return null;
    }
}