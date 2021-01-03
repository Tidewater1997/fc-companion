const fs = require('fs');
const dateFormat = require('dateformat');

let logLimit = 920000; //in bytes - 1mb is roughly 10,000 lines
let logFile = "log.txt";

function log(msg) {
    msg = getTime() + msg;

    appendFile(msg);

    console.log(msg);
}

function error(e) {
    msg = `**********\nError at ${getTime()}\n\n${e}\n\nHere is the trace:\n${Error().stack}\n**********`

    appendFile(msg);

    console.error(msg);
}

function appendFile(msg) {
    let msgLineSize = msg.split("\n").length;

    if(!fs.existsSync(logFile)){
		fs.openSync(logFile, 'w');
    }

    let previousLog = fs.readFileSync(logFile).toString();
    let fileSize = (new TextEncoder().encode(previousLog)).length;

    if (fileSize > logLimit) {
        //remove amount of lines equivalent to what we're writing so it doesn't grow over time
        previousLog = previousLog.split("\n").slice(msgLineSize).join("\n");
    }

    if (previousLog != "") previousLog = previousLog + "\n";

    fs.writeFileSync(logFile, previousLog + msg)
}

function getTime() {
    let date = new Date;
    return dateFormat(date, "ddd mm/dd/yyyy hh:MM:ssTT - ");
}

module.exports.log = log;
module.exports.error = error;