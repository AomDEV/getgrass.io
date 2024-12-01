import { config as dotenv } from 'dotenv';
import { Executor } from './executor';
import { Logger } from './instance/logger';
import { Router } from './router';

dotenv();
async function main () {
    console.log("================================")
    console.log("Github: @AomDEV/getgrass.io")
    console.log("* An unofficial application *")
    console.log("================================")
    const driver = await new Executor().setup();
    await new Router().serve(driver);
}
main().catch(e => {
    Logger.warning(e);
});