const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const path = require('path');
const BSON = require('bson');

if (workerData.data) {

    const data = BSON.serialize(workerData.data);
    fs.writeFileSync(workerData.file,data);
    // console.log(data);
    // fs.writeFileSync(workerData.file+"JSONTEST.json", JSON.stringify(workerData.data, null, 2));
    parentPort.postMessage('done');
} else {
    const data = fs.readFileSync(workerData.file);
    const doc = BSON.deserialize(data);
    // console.log("JSON FIKLE "+doc);
    // const data = JSON.parse(fs.readFileSync(workerData.file));
    parentPort.postMessage(doc);
}

// const { workerData, parentPort } = require('worker_threads');
