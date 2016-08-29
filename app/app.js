const fs = require('fs'),
	path = require('path'),
	shuffle = require('knuth-shuffle').knuthShuffle;

// Some utility functions
function getDirectories(srcpath) {
	return fs.readdirSync(srcpath).filter(file => {
		return fs.statSync(path.join(srcpath, file)).isDirectory();
	});
}

// Build an array of all images
console.log('Getting all images');
let images = [];
let baseDataDir = './data/';
let dataDir = 'images_background';
let alphabets = getDirectories(baseDataDir + dataDir + '/');
for(let a=0; a<alphabets.length; a++) {
	let alphaDir = baseDataDir + dataDir + '/' + alphabets[a] + '/';
	let characters = getDirectories(alphaDir);
	for(let c=0; c<characters.length; c++) {
		let charDir = alphaDir + characters[c] + '/';
		let samples = fs.readdirSync(charDir);
		for(let s=0; s<samples.length; s++) {
			images.push({
				label: samples[s].split('_')[0],
				alphabet: alphabets[a],
				character: characters[c],
				path: charDir + samples[s]
			});
		}
	}
}

// Randomly shuffle the array
console.log('Shuffling...');
shuffle(images);

// Create a JSON file for the labels
let labels = [];
for(let i=0; i<images.length; i++) {
	labels.push([images[i].label, images[i].alphabet]);
}
let labelsJSON = JSON.stringify(labels);
fs.writeFile('./output/' + dataDir + '.json', labelsJSON, () => {
	console.log('Saved labels as JSON');
});

// Make a canvas big enough to fit all the images (i.e. massive)
const charDim = 28; // we'll resize them from 105x105
const canvasCols = 20; // 20 will always be a good divisor because there are 20 versions of each character
const canvasRows = images.length / canvasCols;
const c = document.createElement('canvas');
const ctx = c.getContext('2d');
c.width = canvasCols * charDim;
c.height = canvasRows * charDim;
document.body.appendChild(c);

// Draw the characters onto the canvas in batches
let i = 0;
function batchAddImages(startAt) {
	let promises = [];
	while(i<startAt + 20) {
		promises.push(new Promise((resolve, reject) => {
			let xpos = i * charDim % (canvasCols * charDim);
			let ypos = Math.floor(Math.max(i, 0.1) / canvasCols) * charDim;
			let inputImg = new Image();
			inputImg.src = images[i].path;
			inputImg.onload = () => {
				if(i===60)console.log(inputImg.src);
				ctx.drawImage(inputImg, xpos, ypos, charDim, charDim);
				resolve(this.response);
			}
		}));
		i++
	}

	Promise.all(promises).then(values => {
		if(i<images.length) {
			if(i%1000 === 0) {
				console.log('Added ' + i + ' images. ' + Math.round(i / images.length * 100) + '% complete.');
			}
			batchAddImages(i);
		} else {
			console.log('All images added to canvas');
			canvas2Image();
		}
	}, reason => {
		console.log('Not all images loaded', reason);
	});
}
batchAddImages(i);

// Continue after images have loaded
function canvas2Image() {

	// Invert colours to be more like MNIST
	console.log('Inverting colours');
	let imageData = ctx.getImageData(0, 0, c.width, c.height);
    let data = imageData.data;
    for(let d=0; d<data.length; d+=4) {
      // red
      data[d] = 255 - data[d];
      // green
      data[d + 1] = 255 - data[d + 1];
      // blue
      data[d + 2] = 255 - data[d + 2];
    }
    // Overwrite original image
    ctx.putImageData(imageData, 0, 0);

    // Save as a PNG
    let base64 = c.toDataURL();
    let img = base64.replace(/^data:image\/\w+;base64,/, "");
	let buf = new Buffer(img, 'base64');
	fs.writeFile('./output/' + dataDir + '.png', buf);

	console.log('Saved image');

}