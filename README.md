#Omniglot Data Preprocessor#

I wanted to use the [Omniglot dataset](https://github.com/brendenlake/omniglot) in a JavaScript neural net, so needed to get the files into a more readable form.

In the output folder you'll find images_background.png and images_evaluation.png. These contain all the images, in random order, 20 per row, from the corresponding folders in the omniglot set. They're also scaled down to 28x28px each and the colours are inverted.

Each image in the output folder also has a corresponding JSON file, which is an array of the character label and alphabet in the same order as the image. It looks like this:

    [
        ["character", "alphabet"],
        ...
    ]

If you want to actually run the pre-processor yourself, you'll first need to [get the zipped data from the Omniglot repo](https://github.com/brendenlake/omniglot/tree/master/python) and put it in a new folder in the root called `data`. You can then get started with `npm install` and then `npm start` or `electron .` to run.

The pre-processor can only do one main folder at a time (E.g. images_background or images_evaluation). You'll find a variable called `dataDir` near the top of `app/app.js` where you can set that.

##Code Quality##
Is shit. You may get some errors. Sorry about that!