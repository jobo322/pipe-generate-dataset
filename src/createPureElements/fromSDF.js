const sdfParser = require('sdf-parser');
const nmrPredictor = require('nmr-predictor');
const SD = require('spectra-data');
const fs = require('fs');

module.exports = function(path, options) {
    var file = fs.readFileSync(path);
    var result = sdfParser(file.toString());
    return result.molecules.map((molecule) => {
        return nmrPredictor.spinus(molecule.molfile.value, {group: true}).then((prediction) => {
            return SD.NMR.fromSignals(prediction, options).getYData();
        });
    });
}