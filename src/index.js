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
};

start(argv);
async function start(argv) {
    if (argv.jsonConfig) {
        var file = fs.readFileSync(argv.jsonConfig);
        var options = JSON.parse(file.toString());
    } else {
        new ErrorEvent('Should has a jsonConfig file');
    }
    
    if (argv.fromSDF) {
        if (fs.existsSync(argv.fromSDF)) {
            var result = readSDF(argv.fromSDF, options);
        } else {
            new Error('There is not a SDF to read');
        }
    }

    options = checkOptions(options, 6);//result.length);
    console.log(options.classes[0].elements.length)
    let pureElements = await Promise.all(result);

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

function readSDF(path, options) {
    var file = fs.readFileSync(path);
    var result = sdfParser(file.toString());
    return result.molecules.map((molecule) => {
        return nmrPredictor.spinus(molecule.molfile.value, {group: true}).then((prediction) => {
            return SD.NMR.fromSignals(prediction, options).getYData();
        });
    });
}

function checkOptions(options, nbPureElements) {
    options = Object.assign({}, options, defaultOptions);
    if (options.defaultBehavior) {
        let classes = options.classes;
        
        let {name, parameters} = options.defaultBehavior.distribution;
        let {mean, meanType, standardDeviation} = parameters;
        for (let i = 0; i < classes.length; i++) {
            if (classes[i].elements.length < nbPureElements) {
                let newElements = new Array(nbPureElements).fill(0);
                for (let e of classes[i].elements) {
                    newElements[e.index] = e;
                }
                for (let j = 0; j < nbPureElements; j++) {                    
                    if (newElements[j] === 0) {
                        let newMean = getMean(options.meanComposition[i], mean[i], standardDeviation[i], meanType[i]);
                        newElements[j] = {
                            index: i,
                            distribution: {
                                name: name[i],
                                parameters: {
                                    mean: newMean,
                                    standardDesviation: standardDeviation[i]
                                }
                            }
                        }
                    }
                }
                classes[i].elements = newElements;
            }
        }
    }
    return options;
}

function getMean(meanComposition, mean, std, meanType) {
    return mean;
}
function waitForVariable(waited, time) {
    if (!waited) {
        setTimeout(waitForVariable(waited), time);
    }
}
