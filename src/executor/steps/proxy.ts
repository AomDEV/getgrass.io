import { By, ThenableWebDriver } from "selenium-webdriver";

export async function Proxy_Step(driver: ThenableWebDriver) {
    try {
        await driver.get("https://httpbin.co/ip");
        const response = await driver.findElement(By.xpath(`//pre`)).then((elem) => elem.getText());
        const { origin: proxyIp } = JSON.parse(response) as { origin: string };
        return proxyIp;
    } catch (e) {
        return null;
    }
}