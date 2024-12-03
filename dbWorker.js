const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const path = require('path');

try {
    if (workerData.data) {
        fs.writeFileSync(workerData.file, JSON.stringify(workerData.data, null, 2));
        parentPort.postMessage('saved');
    } else {
        const data = JSON.parse(fs.readFileSync(workerData.file));
        parentPort.postMessage(data);
    }
} catch (error) {
    parentPort.postMessage({ error: error.message });
}