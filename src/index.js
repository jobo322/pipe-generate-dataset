#!/usr/bin/env node
const fs = require('fs');
const argv = require('yargs').argv;
const generateDataset = require('generate-dataset');
const {fromSDF} = require('./createPureElements/createElements');
const checkOptions = require('./checkOptions');

var defaultOptions = {
    frequency: 400,
    from: 1,
    to: 9,
    lineWidth: 1,
    nbPoints: 256 * 3,
    maxClusterSize: 6,
};

start(argv);
async function start(argv) {
    if (argv.jsonConfig) {
        var file = fs.readFileSync(argv.jsonConfig);
        var options = JSON.parse(file.toString());
    } else {
        new ErrorEvent('Should has a jsonConfig file');
    }

    let {
        pathToWrite,
        predictionOptions = {},
        keepPureElements = false
    } = options;
    
    if (argv.fromSDF) {
        if (fs.existsSync(argv.fromSDF)) {
            predictionOptions = Object.assign({}, defaultOptions, predictionOptions);
            var result = fromSDF(argv.fromSDF, predictionOptions);
        } else {
            new Error('There is not a SDF to read');
        }
    }

    options = checkOptions(options, result.length);
    let pureElements = await Promise.all(result);
    let data = generateDataset(pureElements, options);

    if (keepPureElements) {
        data.pureElements = pureElements;
    }

    if (pathToWrite) {
        for (let key in data) {
            let path = fs.realpathSync(pathToWrite);
            writeOutput(data[key], path + '/' + key + '.csv');
        }
    }
    return data;
}

async function writeOutput(matrix, path) {
    let tmpOutput = '';
    if (Array.isArray(matrix[0])) {
        for (let j of matrix) {
            tmpOutput += j.join(', ');
            tmpOutput += '\n';
        }
    } else {
        tmpOutput = matrix.join(', ');
    }

    fs.writeFile(path, tmpOutput, (err) => {
        if (err) throw err;
    });
}
