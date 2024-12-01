import { By, ThenableWebDriver, WebElement } from "selenium-webdriver";
import { delay } from "../../utils";
import { Logger } from "../../instance/logger";
import { Browser } from "../../instance/browser";

export async function SignIn_Step(driver: ThenableWebDriver) {
    await driver.get('https://app.getgrass.io/');
    Logger.info("Waiting for sign-in page loaded");
    let sleep = 0;
    let acceptCookieButton: WebElement, usernameInput: WebElement, passwordInput: WebElement, submitButton: WebElement;

    while (true) {
        try {
            acceptCookieButton = await driver.findElement(By.xpath(`//button[contains(text(), "ACCEPT ALL")]`))
            usernameInput = await driver.findElement(By.xpath(`//input[@name="user"]`))
            passwordInput = await driver.findElement(By.xpath(`//input[@name="password"]`))
            submitButton = await driver.findElement(By.xpath(`//button[@type="submit"]`))
            break;
        } catch {
            await delay(1000);
            sleep += 1;
            if (sleep > 15) {
                Logger.warning("Could not load sign-in page");
                await new Browser().report(driver);
                return false;
            }
        }
    }
    Logger.success("Sign-in page was loaded");
    
    await acceptCookieButton.click();
    await delay(1000);
    await usernameInput.sendKeys(process.env.USERNAME);
    await passwordInput.sendKeys(process.env.PASSWORD);
    await submitButton.click();

    sleep = 0;
    Logger.info("Waiting for sign-in response");
    while (true) {
        try {
            await driver.findElement(By.xpath('//*[contains(text(), "Dashboard")]'))
            break;
        } catch {
            await delay(1000)
            sleep += 1
            if (sleep > 30) {
                Logger.warning('Could not sign-in, Please double check your username and password');
                await new Browser().report(driver);
                return false;
            }
        }
    }
    Logger.success('Sign-in successfully')
    return true;
}