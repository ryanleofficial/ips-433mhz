// Requirements
var KalmanFilter 		= require('kalmanjs').default;
var kalman_filter 		= new KalmanFilter();
var express    			= require('express');
var app 	   			= express();
var sylvester 			= require('sylvester');
var http       			= require('http');
var bodyParser 			= require('body-parser');
var optimizedAverage 	= require('optimized-averages');


// Static Variables
var sig_prop_constant = 2.0;
var process_noise = 0.01;	// Kalman parameter {R}
var measurement_noise = 3;	// Kalman parameter {Q}
var use_kalman_filter = 0;
var measured_tx_power_level = -39// calebration 1 meter
var display_on_webserver = 1;
var grid_size = 4;
var data_block1 = [];
var data_block2 = [];
var data_block3 = [];
// Static variables for the nodes.

// ***** Configure the sender coordinates here *******
var node1 = {
	name: 'NODE #1',
	rssi: 0,
	x: 9.1,
	y: 3.6, 
	d: 0,
	d_android:0
};
var node2 = {
	name: 'NODE #2',
	rssi: 0,
	x: 3.6,
	y: 5.1,
	d: 0,
	d_android:0
};
var node3 = {
	name: 'NODE #3',
	rssi: 0,
	x: 0.9,
	y: 0.9, 
	d: 0,
	d_android:0
};
// ***********	End of Configuration **********

function calculate_D() {
	var D = $M([
		[(2*(node2.x - node1.x)), (2*(node2.y - node1.y))],
		[(2*(node3.x - node1.x)), (2*(node3.y - node1.y))]
	]);
	return D; 
}

function calculate_Dx() { 
	var Dx = $M([	 
		[((Math.pow(node1.d, 2) - Math.pow(node2.d, 2)) - (Math.pow(node1.x, 2) - Math.pow(node2.x, 2)) - (Math.pow(node1.y, 2) - Math.pow(node2.y, 2))), (2*(node2.y - node1.y))],
		[((Math.pow(node1.d, 2) - Math.pow(node3.d, 2)) - (Math.pow(node1.x, 2) - Math.pow(node3.x, 2)) - (Math.pow(node1.y, 2) - Math.pow(node3.y, 2))), (2*(node3.y - node1.y))]
	]);
	return Dx;
}
function calculate_Dy() {
	var Dy = $M([
		[(2*(node2.x - node1.x)), ((Math.pow(node1.d, 2) - Math.pow(node2.d, 2)) - (Math.pow(node1.x, 2) - Math.pow(node2.x, 2)) - (Math.pow(node1.y, 2) - Math.pow(node2.y, 2)))],
		[(2*(node3.x - node1.x)), ((Math.pow(node1.d, 2) - Math.pow(node3.d, 2)) - (Math.pow(node1.x, 2) - Math.pow(node3.x, 2)) - (Math.pow(node1.y, 2) - Math.pow(node3.y, 2)))]
	]);
	return Dy;
}

// Calculate Dx, Dy using andoird distance 
function andoird_calculate_Dx() { 
	var Dx = $M([	 
		[((Math.pow(node1.d_android, 2) - Math.pow(node2.d_android, 2)) - (Math.pow(node1.x, 2) - Math.pow(node2.x, 2)) - (Math.pow(node1.y, 2) - Math.pow(node2.y, 2))), (2*(node2.y - node1.y))],
		[((Math.pow(node1.d_android, 2) - Math.pow(node3.d_android, 2)) - (Math.pow(node1.x, 2) - Math.pow(node3.x, 2)) - (Math.pow(node1.y, 2) - Math.pow(node3.y, 2))), (2*(node3.y - node1.y))]
	]);
	return Dx;
}
function andoird_calculate_Dy() {
	var Dy = $M([
		[(2*(node2.x - node1.x)), ((Math.pow(node1.d_android, 2) - Math.pow(node2.d_android, 2)) - (Math.pow(node1.x, 2) - Math.pow(node2.x, 2)) - (Math.pow(node1.y, 2) - Math.pow(node2.y, 2)))],
		[(2*(node3.x - node1.x)), ((Math.pow(node1.d_android, 2) - Math.pow(node3.d_android, 2)) - (Math.pow(node1.x, 2) - Math.pow(node3.x, 2)) - (Math.pow(node1.y, 2) - Math.pow(node3.y, 2)))]
	]);
	return Dy;
}

function calculate_distance(rssi, tx_power_level) {

	var exponent = ((measured_tx_power_level - rssi)/(10 * sig_prop_constant))
	var distance_in_meters = Math.pow(10, exponent);
	return distance_in_meters;
}

// From Android Library
function calculate_distance_2(rssi, tx_power_level) {

	var distance = ((0.89976) * Math.pow((rssi/tx_power_level), 7.7095)) + 0.111;
	return distance;
}

function convert_to_feet(dist) {
	return dist * 3.280839895;
}

function filter_rssi(data_block) {
	var Kalmandata = data_block.map(function(v) {
		return kalman_filter.filter(v);
	});
	return Kalmandata;
}

function get_data_block(data) {
	for (i=0; i<data.length; i++) {
		if (data[i].ssid == 'Node1') {
			data_block1.push(data[i].rssi);
		}
		if (data[i].ssid == 'Node2') {
			data_block2.push(data[i].rssi);
		}
		if (data[i].ssid == 'Node3') {
			data_block3.push(data[i].rssi);
		}
	}
}
function get_Average(arr) {
	var current_data = [];
	var avg_rssi = 0;
		for (i=0; i<arr.length; i++) {
			current_data[i] = arr[i] * (-1);
		}
	avg_rssi = optimizedAverage(current_data);
	return avg_rssi * (-1);
}

// Start Here
console.log('Initializing Kalman Filter....');
	kalman_filter = new KalmanFilter({R: process_noise, Q: measurement_noise});
console.log('Calculating maxtrix D....');
console.log("Waiting for data ... ");
	var D = calculate_D();
	var determinant_of_D = D.det();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(80);

// Receiving data from PI
app.post("/post", function (req, res) 
{
		var data_from_pi = req.body;
			if (typeof(data_from_pi) == 'undifined' && data_from_pi == null) {
				console.log("No data receive.!");
			}
		console.log("Data Received ! Let's go....");
		console.log(data_from_pi.Data);

		get_data_block(data_from_pi.Data);
		// Check for more than 10 value in each block
		if ((data_block1.length > 10) || 
				(data_block2.length > 10) ||
				(data_block1.length > 10)) {
			data_block1.shift();
			data_block2.shift();
			data_block3.shift();
		} 
		
		//Apply Kalman filter + and get the mean rssi
		node1.rssi = get_Average(filter_rssi(data_block1));
		node2.rssi = get_Average(filter_rssi(data_block2));
		node3.rssi = get_Average(filter_rssi(data_block3));
		// Convert to distances 
		node1.d = calculate_distance(node1.rssi,measured_tx_power_level);
		node2.d = calculate_distance(node2.rssi,measured_tx_power_level);
		node3.d = calculate_distance(node3.rssi,measured_tx_power_level);

		// Using Android formular
		node1.d_android = calculate_distance_2(node1.rssi,measured_tx_power_level);
		node2.d_android = calculate_distance_2(node2.rssi,measured_tx_power_level);
		node3.d_android = calculate_distance_2(node3.rssi,measured_tx_power_level); 

		//Trilateration
		Dx = calculate_Dx();
		Dy = calculate_Dy();

		//Andoird 
		Dx_andoird = andoird_calculate_Dx();
		Dy_andoird = andoird_calculate_Dy();

		var x = (Dx.det() / determinant_of_D);
		var y = (Dy.det() / determinant_of_D);

		var x_andoird = (Dx_andoird.det() / determinant_of_D);
		var y_andoird = (Dy_andoird.det() / determinant_of_D);

		console.log( '(' +x +', ' +y  +')' + 'in meter');
		console.log('(' +convert_to_feet(x) +', ' +convert_to_feet(y) +')' + 'in ft');

		console.log('Andoird Result: ');
		console.log( '(' +x_andoird +', ' +y_andoird  +')' + 'in meter');
		console.log('(' +convert_to_feet(x_andoird) +', ' +convert_to_feet(y_andoird) +')' + 'in ft');

res.status(200).send(req.body);		
});

process.on( 'SIGINT', function() {

	console.log('Quitting.... ');
	process.exit( );
});






