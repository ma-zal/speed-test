'use strict';

/**
 * @author Martin Zaloudek, zal.cz
 */ /**/


let cancelCallback = null;

const STATISTICS_UPDATE_INTERVAL = 500;

function onStartButtonClick() {
    
    if (cancelCallback) {
   		return;
   		// prevent to run twice at same time
   	}
       
    
	document.getElementById('testSizeMB').disabled = true;
	document.getElementById('startButton').disabled = true;
	document.getElementById('cancelButton').disabled = false;
	
	if (clearGraph) {
		clearGraph();
	}
	
	const testSizeMB = document.getElementById('testSizeMB').value;

	const callbacks = downloadSpeedTest('random-data.php?sizeMB=' + testSizeMB, onSpeedTestFinished);
    cancelCallback = callbacks.cancel;
}

/**
 * @param {string} result
 */
function onSpeedTestFinished(result) {
    document.getElementById('testSizeMB').disabled = false;
	document.getElementById('startButton').disabled = false;
	document.getElementById('cancelButton').disabled = true;
	
    setStatus(result);
    
    cancelCallback = null;
    
}

function downloadSpeedTest(url, onSpeedTestFinished) {
	
    let xhr = null;
    let interval = null;

	let startTime = new Date();
	
	let currentSpeed = null;
	let averageSpeed = null;
	let fileSize = null;
	
    let lastDownloadedBytes = null;
   	let lastTickTime = null;

    let previousDownloadedBytes = 0;
   	let previousTickTime = startTime;

	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(this.readyState === this.HEADERS_RECEIVED) {
			fileSize = xhr.getResponseHeader("Content-Length");
        }

        if (xhr.readyState === 4) {
            // On test finished
            
            resetSpeedTest();
            if (xhr.status === 200) {
                onSpeedTestFinished("Finished");
            } else {
                onSpeedTestFinished("Failed");
            }
        }
	};        
	xhr.responseType = "text";
	xhr.open("GET", url, true);
	xhr.onprogress = function () {
		lastDownloadedBytes = xhr.responseText.length;
		lastTickTime = new Date();
	};
	
	interval = setInterval(function() {
        const statistics = countStatistics(lastDownloadedBytes, lastTickTime, previousDownloadedBytes, previousTickTime);	    

        viewStatistics(statistics, lastDownloadedBytes, fileSize);	   
        
        previousTickTime = lastTickTime;
        previousDownloadedBytes = lastDownloadedBytes;
        
    }, STATISTICS_UPDATE_INTERVAL);
	
	setStatus("Testing download ...");
	xhr.send();


    /**
     * @returns {{currentSpeed: number, averageSpeed: number}}
     */
	function countStatistics(lastDownloadedBytes, lastTickTime, previousDownloadedBytes, previousTickTime) {
        let intervalMiliseconds = lastTickTime.getTime() - previousTickTime.getTime();
        let intervalDownloaded = lastDownloadedBytes - previousDownloadedBytes;
        
        if (intervalDownloaded > 0) {
            currentSpeed = intervalDownloaded / intervalMiliseconds * 1000;
        } else {
            currentSpeed = 0;
        }
    
        let totalMiliseconds = lastTickTime.getTime() - startTime.getTime();
        if (totalMiliseconds > 0) {
            averageSpeed = lastDownloadedBytes / totalMiliseconds * 1000;
        } else {
            averageSpeed = 0;
        }
        
        return {
            currentSpeed: currentSpeed,
            averageSpeed: averageSpeed
        }
    }

    /**
     * @param {{currentSpeed: number, averageSpeed: number, downloadedBytes: number}} statistics
     */
    function viewStatistics(statistics, lastDownloadedBytes, totalFileSize) {
	    
        // Add current speed to graph
        addGraphValue(statistics.currentSpeed);
		
		
		// View
		document.getElementById('averageSpeed').textContent = (statistics.averageSpeed / 1024/1024*8).toFixed(2) + " Mib/s";
		document.getElementById('currentSpeed').textContent = (statistics.currentSpeed / 1024/1024*8).toFixed(2) + " Mib/s";

		if (totalFileSize) {
			setStatus("Testing " + (lastDownloadedBytes / totalFileSize * 100).toFixed(0) + "% of " + (totalFileSize/1024/1024).toFixed(0) + " MiB ...")
		}

    }
    
    function resetSpeedTest() { 
        clearInterval(interval);

        fileSize = null;
        
        if (xhr.readyState < 4) {
            xhr.onprogress = null;
            xhr.abort();
        }
            
        document.getElementById('currentSpeed').textContent = '--';
    }

	function cancel() {
        resetSpeedTest();
        onSpeedTestFinished("Cancelled");
        
    }

    return {cancel: cancel};
}


function cancel() {
	if (cancelCallback) {
        cancelCallback();
	}
    cancelCallback = null;
}

function setStatus(text) {
	document.getElementById('status').textContent = text;
}


