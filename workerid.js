const { workerData, parentPort } = require('worker_threads');
const { data, id } = workerData;
const result = data[id] || null;
parentPort.postMessage(result);