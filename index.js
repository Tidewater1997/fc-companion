const express = require('express');
const app = express();
const regedit = require('regedit')
const { exec, execFile, spawn, execSync } = require("child_process");
const nircmd = require('nircmd');
const logger = require('./logger.js');

let wd = process.cwd();

//nircmd('win activate stitle "Fantastic Contraption 1"');

regedit.list('HKCU\\SOFTWARE\\Classes\\FantasticContraption1\\shell\\open\\command', function(err, result) {
    let regEntry = result['HKCU\\SOFTWARE\\Classes\\FantasticContraption1\\shell\\open\\command'].values[''].value

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
            }
        });

        logger.log("trying to focus \"Fantastic Contraption 1\"");

        nircmd('win activate stitle "Fantastic Contraption 1"');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify("200 OK")); //write a response to the client
        res.end();
    }).listen(58889);

    app.get("/status", function(req, res) {
        let status = {"server": "alive", "FC-path": exepath}

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(status)); //write a response to the client
        res.end();
    });

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