const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const path = require('path');

if (workerData.data) {
    fs.writeFileSync(workerData.file, JSON.stringify(workerData.data, null, 2));
    parentPort.postMessage('done');
} else {
    const data = JSON.parse(fs.readFileSync(workerData.file));
    parentPort.postMessage(data);
}

// const { workerData, parentPort } = require('worker_threads');
