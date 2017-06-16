# Optimized Averages
A small utility to optimize data averaging by ignoring irrelevant data that can go kick rocks. Mostly built for handling the data being received by [beacons](http://estimote.com/) during user location calculation instances. 

The distance provided by the beacons comes constantly and can be consistently inconsistent, which is what led to the creation of this small utility. Say the user is 2m away from the beacon, but you receive the following distances from the beacon:

	[14.78, 2.25, 2.45, 1.87, 1.89, 2.11, 9.33, 1.97, 2.06, 1.93, 2.22, 2.22, 11.17]

Some of these are unlike the others. Namely the _14_, _9_, and the _11_. They do not belong. That's fine though, we can get rid of those.

	> optimizedAverage( beaconDistances );
	< 2.10

## Usage
The optimizer will go through the array and tally how many times a number occurs within the array, which it then uses to determine what the most probable distance is _(which would be 2 in the example above, as it appears 6 times while 1 merely appeared 4)_ and then promptly removes any numbers that are greater than double the probable distance and less than half the probable distance (this may change to a configurable buffer in the future if the need is expressed).

	var data = [14.78, 2.25, 2.45, 1.87, 1.89, 2.11, 9.33, 1.97, 2.06, 1.93, 2.22, 2.22, 11.17];
	var avg = optimizedAverage( data );
	// Pre-optimized average: 4.33
	// Items removed: 3 [14.78, 9.33, 11.17]
	// Optimized average: 2.10

## Installation
The utility is both exported as a module for Browserify / Node fun and exposed to the global scope if it's included in the browser, so installation is fairly straight forward.

### Browser
1. Clone down the repo or `npm install optimized-averages`
2. Move the minified file into your libs/scripts folder
3. Toss it on the page yo!
4. Average like a beast via `optimizedAverage( arrayOfNumbersGoesHerePlz );`

### NPM / Browserify
1. Install the util as a dependency: `npm install --save-dev optimized-averages`
2. Require it up! `var optimizedAverage = require('optimized-averages');`
3. Average like an absolute savage `optimizedAverage( anArrayPlzINeedAnArrayImHunger );`

## Thoughts?
If you think this could be extended into something rad feel free to shoot me a message or log an issue. PR's are of course welcome as well.