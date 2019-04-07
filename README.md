# pipe-generate-dataset

With this library you can create a database of nmr 1D predicted spectra from a sdf file. You allow to create severals classes with some selected biomarker, mean and deviation for each class. In jsonConfig.json file you can find an example of the configuration file. If you have the pure elements to make the dataset, you can use a more general package like https//github.com/mljs/generate-dataset

the library return 5 file with database and some util information:

classMatrix.csv -> classes at the matrix binary format e.g. [[0,1,0],[1,0,0],[0,1,0]]
classVector.csv -> classes at array format e.g. [1,1,2,1,2]
compositionMatrix.csv -> matrix with the percentaje of each pureElement in each mixture spectrum.
pureElement.csv -> spectra used for make up the dataset.
dataset.csv -> matrix dataset.

## Installation

`$ git clone https://github.com/jobo322/pipe-generate-dataset`

## Usage

```js
node src/index.js --jsonConfig jsonConfig.json --fromSDF set.sdf
//the result is ... 5 writed file into pathToWrite if it is defined in jsonConfig otherwise in ./ 
```

## License

  [MIT](./LICENSE)

