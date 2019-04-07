#!/usr/bin/env node
const generateDataset = require('ml-generate-dataset');
const argv = require('yargs').argv;
const fs = require('fs');
const OCL = require('openchemlib');
const path = require('path')
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
    if (argv.jsonConfig && fs.existsSync(argv.jsonConfig)) {
        let jsonString = fs.readFileSync(argv.jsonConfig);
        var options = Object.assign({}, defaultOptions, JSON.parse(jsonString.toString()));
        var pathToWrite = options.pathToWrite ? fs.realpathSync(options.pathToWrite) : fs.realpathSync('./');
    }
    if (argv.fromSDF && fs.existsSync(argv.fromSDF)) {
        var sdf = fs.readFileSync(argv.fromSDF);
        var parser = new OCL.SDFileParser(sdf.toString());
        var pureElements = [];
        while (parser.next()) {
            let molecule = parser.getMolecule();
            let prediction = await nmrPredictor.spinus(molecule.toMolfile());
            let simulation = SD.NMR.fromSignals(prediction, options || defaultOptions);
            console.log(simulation.sd.spectra[0].nbPoints)
            pureElements.push(simulation.getYData());
        }
    }
    if (options && pureElements) {
        let result = generateDataset(pureElements, options);
        result.pureElements = pureElements;
        for (let i in result) {
            let matrix = result[i];
            let tmpOutput = '';
            if (Array.isArray(matrix[0])) {
                for (let j of matrix) {
                    tmpOutput += j.join(', ');
                    tmpOutput += '\n';
                }
                tmpOutput[tmpOutput.length -1] = '';
            } else {
                tmpOutput = matrix.join(', ');
            }

            let currentPath = path.format({dir: pathToWrite, base: i + '.csv'});
            fs.writeFile(currentPath, tmpOutput, (err) => {
                if (err) throw err;
                console.log('The file has been saved!');
              }
            );
        }
    }
}

start().then(() => console.log('end'));
