require('dotenv-defaults').config();

// const main = require('../core/main');
const cron = require('node-cron');

console.log('Pouzity cron expression', process.env.CRON_EXPRESSION);

const validateOutput = cron.validate(process.env.CRON_EXPRESSION);

if (!validateOutput) {
    const msg = "Cron expression nie je validny!";
    console.log(msg, process.env.CRON_EXPRESSION);console.error(msg, process.env.CRON_EXPRESSION);
    process.exit(1);
}

console.log('Cron expression validny');

// vsetko v poriadku => pustam cron //

cron.schedule(process.env.CRON_EXPRESSION, () => {
    console.log('Spustam cron job');

    // main.run();
}, {
    timezone: "Europe/Bratislava"
});