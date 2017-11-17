#!/usr/bin/env node
const generateDataset = require('generate-dataset');
const argv = require('yargs').argv;
const fs = require('fs');
const sdfParser = require('sdf-parser');
const nmrPredictor = require('nmr-predictor');
const SD = require('spectra-data');

var defaultOptions = {
    frequency: 400,
    from: 1,
    to: 9,
    lineWidth: 1,
    nbPoints: 256 * 3,
    maxClusterSize: 6,
    withNoise: false
};

start(argv);
async function start(argv) {
    if (argv.fromSDF) {
        if (fs.existsSync(argv.fromSDF)) {
            var result = readSDF(argv.fromSDF);
        } else {
            new Error('There is not a SDF to read');
        }
    }
    if (argv.jsonConfig) {
        var options = null;
        fs.readFile(argv.jsonConfig, (err, file) => {
            if (err) throw err;
            options = checkOptions(file.toString());
        });
    }
    
    let pureElements = await Promise.all(result);
    if (options === null) {
        waitForVariable(options, 100);
    }

    let data = generateDataset(pureElements, options);
    var pathToWrite = options.pathToWrite ? fs.realpathSync(options.pathToWrite) : fs.realpathSync('./');
    for (let i in data) {
        let matrix = data[i];
        let tmpOutput = '';
        if (Array.isArray(matrix[0])) {
            for (let j of matrix) {
                tmpOutput += j.join(', ');
                tmpOutput += '\n';
            }
        } else {
            tmpOutput = matrix.join(', ');
        }

        fs.writeFile(pathToWrite + '/' + i + '.csv', tmpOutput, (err) => {
            if (err) throw err;
        });
    }
}

function readSDF(path) {
    var file = fs.readFileSync(path);
    var result = sdfParser(file.toString());
    return result.molecules.map((molecule) => {
        return nmrPredictor.spinus(molecule.molfile, {group: true}).then((prediction) => {
            return SD.NMR.fromSignals(prediction, defaultOptions).getYData();
        });
    });
}

function checkOptions(options) {
    options = JSON.parse(options);
    return options;
}

function waitForVariable(waited, time) {
    if (!waited) {
        setTimeout(waitForVariable(waited), time);
    }
}
