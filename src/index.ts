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
    const executor = new Executor();

    const driver = await executor.setup();
    await new Router().serve(driver, executor.proxyIp);
}
main().catch(e => {
    Logger.warning(e);
});