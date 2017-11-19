module.exports = function(options, nbPureElements) {
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
    switch (meanType) {
        case 'sd':
            mean *= std;
            break;
        case 'absolute':
            mean = mean;
            break;
        case 'diff':
            mean -= meanComposition;
    }
    return mean;
}
