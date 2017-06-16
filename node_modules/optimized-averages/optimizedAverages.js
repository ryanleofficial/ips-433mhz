/**
 * Optimized Average calculation
 * Takes an array of numbers, then throws away unreliable numbers
 * to get a more precise average.
 *
 * @param {number[]} Numbers - Array of numbers to optimize.
 * @returns {number} - The optimized average, rounded to the nearest hundredth.
 */ 
var optimizedAverage = function optimizeDistanceAverage( Numbers ) {
	/**
	 * Get the average from an array of numbers
	 * @param {number[]} arr - Array of numbers to average
	 * @returns {number} - The average of the numbers.
	 */
	var getAverage = function getAverage( arr ) {
		return arr.reduce( function reduceGetAverage( prev, cur ) {
			return prev + cur;
		}) / arr.length;
	}

	/**
	 * Round a number to the nearest hundredth
	 * @param {number} num - the number to round
	 * @returns {number} - the rounded result
	 */
	var roundResult = function roundResult( num ) {
		return ( Math.round( num * 100 ) / 100 ).toFixed( 2 );
	}

	/**
	 * Tally's up the amount of times a whole number occurs in the array.
	 * @param {number[]} numbers - Array of numbers to iterate over.
	 * @returns {object} - Returns the completed `tally` object.
	 */
	var countNums = function countNums( numbers ) {
		var count = [];
		for (var i = 0; i < numbers.length; ++i) {
			var floored = Math.floor( numbers[i] );
			if ( !count.hasOwnProperty( floored ) ) {
				count[floored] = 1;
			} else {
				++count[floored];
			}
		}

		return count;
	};

	// Determine the most reliable number (the number that appears most)
	var mostReliable = countNums( Numbers ).reduce(function reduceMostReliable(prev, cur, i, arr) {
		return arr[prev] > cur ? prev : i;
	}, 0);

	/** 
	 * Get the average of the provided numbers that are:
	 * 	1. Less than double the most reliable number,
	 *	2. More than half the most reliable number,
	 * 	then round it to the nearest hundredth.
	 */
	return roundResult( getAverage( Numbers.filter( function( num ) {
		return Math.ceil( num ) > ( mostReliable / 2 ) && Math.floor( num ) < ( mostReliable * 2 );
	}) ) );
};

if ( typeof module === "object" && module.exports ) module.exports = optimizedAverage;
if ( typeof window !== "undefined" ) window.optimizedAverage = optimizedAverage;