const { workerData, parentPort } = require('worker_threads');
const { data, index } = workerData;
const keys = Object.keys(data);
const key = keys[index];
parentPort.postMessage({ id: key, document: data[key] });