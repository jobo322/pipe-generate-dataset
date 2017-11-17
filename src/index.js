#!/usr/bin/env node
const generateDataset = require('generate-dataset');
const argv = require('yargs').argv;
const fs = require('fs');
const OCL = require('openchemlib');
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

async function start() {
    if (argv.fromSDF && fs.existsSync(argv.fromSDF)) {
        var sdf = fs.readFileSync(argv.fromSDF);
        var parser = new OCL.SDFileParser(sdf.toString());
        var pureElements = [];
        while (parser.next()) {
            let molecule = parser.getMolecule();
            let prediction = await nmrPredictor.spinus(molecule.toMolfile());
            let simulation = SD.NMR.fromSignals(prediction, defaultOptions);
            pureElements.push(simulation.getYData());
        }
    }
    if (argv.jsonConfig && fs.existsSync(argv.jsonConfig)) {
        let jsonString = fs.readFileSync(argv.jsonConfig);
        var options = JSON.parse(jsonString.toString());
        var pathToWrite = options.pathToWrite ? fs.realpathSync(options.pathToWrite) : fs.realpathSync('./');
    }
    if (options && pureElements) {
        let result = generateDataset(pureElements, options);
        for (let i in result) {
            let matrix = result[i];
            let tmpOutput = '';
            if (Array.isArray(matrix[0])) {
                for (let j of matrix) {
                    tmpOutput += j.join(', ');
                    tmpOutput += '\n';
                }
            } else {
                tmpOutput = matrix.join(', ');
            }

            fs.writeFile(pathToWrite + '/' + i + '.csv', tmpOutput);
        }
    }
}

start().then(() => console.log('end'));
