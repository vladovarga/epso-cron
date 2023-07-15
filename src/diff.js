console.log('Loading differ');

const Diff = require('diff');

const { REGION, BUCKET, LATEST_FILE_NAME, PREVIOUS_FILE_NAME } = require('./env');

const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3"); // CommonJS
const s3Client = new S3Client({region: REGION});

/**
 * Checks for differences between previous and latest job list. 
 * If there are some new job opportunities, it returns them in an array.
 * @return {Array} an array of new job opportunities
 */
module.exports.run = async function run(cityObj) {
    // read latest.txt from this cron run

    const getCommand = new GetObjectCommand({
        Bucket: BUCKET,
        Key: cityObj.code + "/" + LATEST_FILE_NAME
    });

    const getResponse = await s3Client.send(getCommand);

    let latest = await getResponse.Body.transformToString();  

    // console.log("latest", latest);
    
    // read previous.txt from previous cron run
    const getCommand2 = new GetObjectCommand({
        Bucket: BUCKET,
        Key: cityObj.code + "/" + PREVIOUS_FILE_NAME
    });

    let getResponse2

    try{
        getResponse2 = await s3Client.send(getCommand2);
    } catch (e) {
        if (e.name === "NoSuchKey") {
            console.log("Previous file does not exist, returning empty diff")
            return []
        } else {
            console.log("Unknown expcetion, throwing further")
            throw e
        }
    }

    let previous = await getResponse2.Body.transformToString();  

    // console.log("previous", previous);
    
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