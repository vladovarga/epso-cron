function run() {

    const Diff = require('diff');
    const fs = require('fs');
    const mailer = require('./mailer');

    // read latest.txt from this cron run
    let latest = fs.readFileSync('downloads/latest.txt', 'utf8', (err, data) => {
        if (err) {
            mailer.mailError();
            console.error('Could not find latest.txt!');
            throw err;
        }
    });

    // read previous.txt from previous cron run
    let previous = fs.readFileSync('downloads/previous.txt', 'utf8', (err, data) => {
        if (err) {
            mailer.mailError();
            console.error('Could not find previous.txt!');
            throw err;
        }
    });

    // console.log("previous", previous);
    // console.log("latest", latest);

    // diff previous and latest
    let differences = Diff.diffTrimmedLines(previous, latest);

    // console.log(differences);

    // filter out only those which were added
    let onlyAdded = differences.filter(difference => (difference.added == true));

    if (Array.isArray(onlyAdded) && onlyAdded.length == 0) {
        // if there were no new job opportunities => finish with empty array
        return [];
    }

    // return an array of new opportunities
    return onlyAdded.map(addedObject => addedObject.value);
}

module.exports = {
    "run": run
};