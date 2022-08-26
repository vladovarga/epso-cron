/**
 * Checks for differences between previous and latest job list. 
 * If there are some new job opportunities, it returns them in an array.
 * @return {Array} an array of new job opportunities
 */
function run() {
    const Diff = require('diff');
    const fs = require('fs');
    const { mailer } = require('./mailer');

    // read latest.txt from this cron run
    let latest = fs.readFileSync(process.env.DOWNLOADS_PATH + 'latest.txt', 'utf8', (err, data) => {
        if (err) {
            mailer.mailError();
            console.error('Could not find latest.txt!');
            throw err;
        }
    });

    // read previous.txt from previous cron run
    let previous = fs.readFileSync(process.env.DOWNLOADS_PATH + 'previous.txt', 'utf8', (err, data) => {
        if (err) {
            mailer.mailError();
            console.error('Could not find previous.txt!');
            throw err;
        }
    });

    // console.log("previous", previous);
    // console.log("latest", latest);
    
    // sort alphabetically

    const previousSorted = previous.split(/\n/).sort().join('\n');
    const latestSorted = latest.split(/\n/).sort().join('\n');

    // console.log("previousSorted", previousSorted);
    // console.log("latestSorted", latestSorted);

    // diff previous and latest

    let differences = Diff.diffTrimmedLines(previousSorted, latestSorted);

    // console.log("differences", differences);

    // filter out only those which were added
    let onlyAdded = differences.filter(difference => (difference.added == true));

    if (Array.isArray(onlyAdded) && onlyAdded.length == 0) {
        // if there were no new job opportunities => finish with empty array
        return [];
    }
    
    let result = [];

    // iterate through added objects
    for (const addedObject of onlyAdded) {
        if (addedObject.count == 1) {
            // if the count is 1 => return just the value
            const splitOutput = addedObject.value.split("|");
            result.push({
                "text": splitOutput[0],
                "href": splitOutput[1]
                
            });
        } else if (addedObject.count > 1) {
            // if the count is > 1 => split the value by new line 
            addedObject.value.split("\n").forEach(function(opportunity) {
                const splitOutput = opportunity.split("|");
                result.push({
                    "text": splitOutput[0],
                    "href": splitOutput[1]
                    
                });
            });
        }
    }

    // filter out empty strings
    result = result.filter(opportunity => (opportunity.text != ""));

    // return the result
    return result;
}

module.exports = {
    "run": run
};