const fs = require("fs")
const NwBuilder = require('nw-builder');

let package = JSON.parse(fs.readFileSync("package.json"));

console.log(`./${package.name}/`)

var nw = new NwBuilder({
    files: `./package.json`, // use the glob format
    platforms: ['win32']
});

nw.on('log', console.log);

nw.build().then(function() {
    console.log('all done!');
}).catch(function(error) {
    console.error(error);
});