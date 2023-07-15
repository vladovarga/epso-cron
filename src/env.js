const fs = require('fs');

// read settings.json
const settings = fs.readFileSync("settings.json", 'utf8', (err, data) => {
    if (err) {
        console.error('Could not find settings.json!');
        throw err;
    }
});

module.exports = {
    settings: JSON.parse(settings),

    REGION: process.env.REGION,
    BUCKET: process.env.BUCKET,

    URL_TO_CRAWL: process.env.URL_TO_CRAWL,
    URL_OBJECT: new URL(process.env.URL_TO_CRAWL),
    DOWNLOADS_PATH: process.env.DOWNLOADS_PATH,
    
    MAIL_TO: process.env.MAIL_TO,
    MAIL_TO_DEVELOPER: process.env.MAIL_TO_DEVELOPER,

    LATEST_FILE_NAME: "latest.txt",
    PREVIOUS_FILE_NAME: "previous.txt",
    // key of the parameter in the URL that contains the city ID
    CITY_SEARCH_PARAM_KEY: "field_epso_location_target_id_1"
}

console.log(module.exports);
// console.log(process.env);

// console.log("REGION", REGION)
// console.log("BUCKET", BUCKET)

// console.log("URL_TO_CRAWL", URL_TO_CRAWL)
// console.log("DOWNLOADS_PATH", DOWNLOADS_PATH)

// console.log("LATEST_FILE_NAME", LATEST_FILE_NAME)
// console.log("PREVIOUS_FILE_NAME", PREVIOUS_FILE_NAME)

// console.log("MAIL_TO", MAIL_TO)
// console.log("MAIL_TO_DEVELOPER", MAIL_TO_DEVELOPER)