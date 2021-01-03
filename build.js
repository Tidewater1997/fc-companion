const fs = require("fs")
const NwBuilder = require('nw-builder');
const archiver = require('archiver');
const prompt = require('prompt');

let package = JSON.parse(fs.readFileSync("package.json"));
let dirName = `${package.name}-${package.version}`;
let buildDir = `./build/${dirName}`;
let zipDir = `./build/${dirName}-win32.zip`;

checkExists();

function checkExists() {
	let files = fs.readdirSync("build");
	let exists = files.filter(file => file.indexOf(package.version) > 0);

	if(exists.length > 0){
		console.log("Build number already exists, you probably want to up the NPM version. This will overwrite the existing version. Continue? [y/n]");

		prompt.start();

		prompt.get(["yn"], (err, result) => {
			if(result.yn.charAt(0).toUpperCase() === "Y"){
				try{
					fs.rmdirSync(buildDir, { recursive: true });
					fs.unlinkSync(zipDir);
				} catch(e) {
					console.log(e);
				}

				build();
				return;
			} else {
				return;
			}
		})
	} else {
		build();
	}
}

function build() {
    var nw = new NwBuilder({
        files: "./**/**", // use the glob format
        platforms: ['win32'],
        winIco: "fcc.ico",
        flavor: "normal"
    });

    nw.on('log', console.log);

    nw.build().then(function() {
        console.log('Done building, renaming folder');

        fs.renameSync(`./build/${package.name}`, buildDir);

        zipBuild();
    }).catch(function(error) {
        console.error(error);
    });
}

function zipBuild() {
    const output = fs.createWriteStream(zipDir);
    const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });

    output.on('close', function() {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
    });

    output.on('end', function() {
        console.log('Data has been drained');
    });

    archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
            // log warning
        } else {
            // throw error
            throw err;
        }
    });

    archive.on('error', function(err) {
        throw err;
    });

    archive.pipe(output);

    // append files from a glob pattern

    console.log("Building .zip for deployment");
    archive.directory(`${buildDir}/win32/`, dirName);

    // finalize the archive (ie we are done appending files but streams have to finish yet)
    // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    archive.finalize();
}