#!/usr/bin/env node
const argv = require('yargs').argv;
const fs = require('fs');
const OCL = require('openchemlib');
const nmrPredictor = require('nmr-predictor');
const SD = require('spectra-data');

var options = {
    frequency: 400,
    from: 1,
    to: 9,
    lineWidth: 1,
    nbPoints: 256*3,
    maxClusterSize: 6,
    withNoise: false
};

async function start() {
    if (argv.fromSDF && fs.existsSync(argv.fromSDF)) {
        var sdf = fs.readFileSync(argv.fromSDF);
        var parser = new OCL.SDFileParser(sdf.toString());
        var pureElements = [];
        while(parser.next()) {
            let molecule = parser.getMolecule();
            let prediction = await nmrPredictor.spinus(molecule.toMolfile());
            let simulation = SD.NMR.fromSignals(prediction, options);
            pureElements.push(simulation.getYData());
        }
    }
    if (argv.jsonConfig && fs.existsSync(argv.jsonConfig)) {
        let jsonString = fs.readFileSync(argv.jsonConfig);
        var json = JSON.parse(jsonString.toString());
        console.log(json);
    }
}

start().then(() => console.log('end'));
