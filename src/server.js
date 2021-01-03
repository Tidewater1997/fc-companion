const express = require('express');
const app = express();
const regedit = require('regedit')
const { exec, execFile, spawn, execSync } = require("child_process");
const nircmd = require('nircmd');
const logger = require('./logger.js');

let wd = process.cwd();

const PORT = 58889;
let SERVER_STATUS = "fatal";

//nircmd('win activate stitle "Fantastic Contraption 1"');

regedit.list('HKCU\\SOFTWARE\\Classes\\FantasticContraption1\\shell\\open\\command', function(err, result) {
    let regEntry = result['HKCU\\SOFTWARE\\Classes\\FantasticContraption1\\shell\\open\\command'].values[''].value

    if(!regEntry){
        logger.error("Game does not exist in registry. Is it installed?");
        logger.log("regEntry:" + regEntry);
        return;
    }

    let exepath = regEntry.match(/"(.*?)" "%1"/)[1]

    //remove extra characters from path
    createServer(exepath);
});

function createServer(exepath) {
    let split = exepath.split("\\");
    let dir = split.splice(0, split.length - 1).join("\\");
    let exe = split[split.length - 1]

    app.get("/launch", function(req, res) {
        req.params = params(req);

        if (!req.params.id) {
            res.writeHead(400);
            res.write("Error: missing id");
            res.end();
            return;
        }

        let args = decodeURIComponent(req.params.id);

        logger.log(`spawning "${exe}" with args "${args}" in directory "${dir}"`);

        spawn(exe, [args], { detached: true, cwd: `${dir}` }, function(err, stdout, stderr) {
            if (err || stderr) {
                logger.log("Couldn't open exe, see below");
                logger.log(err);
                logger.log(stderr);
                SERVER_STATUS = "error";
            }
        });

        logger.log("Trying to focus \"Fantastic Contraption 1\"");

        nircmd('win activate stitle "Fantastic Contraption 1"');

        logger.log("Should've focused - ran nircmd command.");

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify("200 OK")); //write a response to the client
        res.end();
    });

    app.get("/status", function(req, res) {
        let status = {"status": SERVER_STATUS, "FC-path": exepath, "port": PORT}

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(status)); //write a response to the client
        res.end();
    });

    app.listen(PORT)

    SERVER_STATUS = "alive";

    logger.log("listening on localhost:58889");
}

//thanks to
//https://stackoverflow.com/questions/16903476/node-js-http-get-request-with-query-string-parameters
var params = function(req) {
    let q = req.url.split('?'),
        result = {};
    if (q.length >= 2) {
        q[1].split('&').forEach((item) => {
            try {
                result[item.split('=')[0]] = item.split('=')[1];
            } catch (e) {
                result[item.split('=')[0]] = '';
            }
        })
    }
    return result;
}