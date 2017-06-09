'use strict';

/**
 * @author Martin Zaloudek, zal.cz
 */ /**/


const GRAPH_MAX_HISTORY_SIZE_SECONDS = 60;


let graphStartDate = null;
let graphLabels = [];
let graphData = [];
let myChart;

// INIT
document.addEventListener('DOMContentLoaded', graphInit, false);

function graphInit() {

	let ctx = document.getElementById("myChart").getContext('2d');
	myChart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: graphLabels,
			datasets: [
				{
					label: 'Speed history',
					data: graphData,
					backgroundColor: '#B2DFDB',
					borderColor: '#009688',
                    borderWidth: 1,
					// lineTension: 2 // interpolation setting
				}
			]
		},
        options: {
            // Hide points
            elements: {point: {radius: 0}},

            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0, // general animation time
            },
            hover: {
                animationDuration: 0, // duration of animations when hovering an item
            },
            responsiveAnimationDuration: 0, // animation duration after a resize    }
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Time (s)'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Speed (Mib/s)'
                    }
                }]

            },
        }
	});
	
	window.addEventListener('resize', function () { myChart.resize() })
	
}


/**
 * Add last measued speed to graph.
 * Note: If history is longer the GRAPH_MAX_HISTORY_SIZE_SECONDS, the oldest values are removed.
 * 
 * @param {number} value - Bytes/s
 */
function addGraphValue(value) {
	if (!graphStartDate) { graphStartDate = new Date(); }
	let intervalSinceStart = (new Date()).getTime() - graphStartDate.getTime();
	graphLabels.push((intervalSinceStart / 1000).toFixed(1));
	graphData.push(value / 1024 / 1024 * 8);
	const maxRecordCount = GRAPH_MAX_HISTORY_SIZE_SECONDS * 1000 / STATISTICS_UPDATE_INTERVAL;
	if (graphData.length > maxRecordCount) {
        graphLabels.shift();
        graphData.shift();
	}
	myChart.update();
}


/**
 * Clear all data from graph.
 */
function clearGraph() {
    graphStartDate = null;
    graphLabels.splice(0, graphLabels.length);
    graphData.splice(0, graphData.length)
    myChart.update();
}