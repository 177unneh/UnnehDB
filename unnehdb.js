const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const EventEmitter = require('events');
const { warn } = require("console");
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { BSON, EJSON } = require('bson');
const { exit } = require("process");

// const DB_FILE = path.join(__dirname, "database.unnehDB");
let UPLOAD_DIR = path.join(__dirname, "uploads"); // Default upload directory

class Database extends EventEmitter {
    constructor(databaseFile = "database", autosaveInterval = 60000, actuallname = "") {
        // this.data = fs.readFileSync(this.DB_FILE);

        super();

        const isPath = databaseFile.includes('/') || databaseFile.includes('\\');

        if (isPath) {
            if (actuallname !== "") {
                this.DB_FILE = path.join(databaseFile, actuallname + ".unnehDB");
            } else {
                this.DB_FILE = databaseFile + ".unnehdatabase.unnehDB";

            }
            // console.log('Database file path set to:', databaseFile);
        } else {
            this.DB_FILE = path.join(__dirname, databaseFile + ".unnehDB");
            if (actuallname !== "") {
                // this.DB_FILE = path.join(__dirname, actuallname+".unnehDB");
                warn("Actuall name is not used in this case as the name for file is databaseFile! Only use this if you selected specific path for it!");
            }
        }

        console.log('Database file path set to:', this.DB_FILE);

        this.autosaveInterval = autosaveInterval; // Auto-save interval in milliseconds
        this.handleProcessExit();
        this.initDB();
        this.startAutoSave();
    }
    // init the database create file!
    initDB() {
        // console.log('Waiting for db.');

        if (!fs.existsSync(this.DB_FILE)) {
            console.log("!fileexist");
            this.data = { collections: {}, indexes: {}, files: {} };
            this.saveDB();
        } else {
            // this.data = JSON.parse(fs.readFileSync(this.DB_FILE));
            this.data = BSON.deserialize(fs.readFileSync(this.DB_FILE));
            // EJSON.parse(this.data);
            const workerPath = path.join(__dirname, 'dbWorker.js');
            // this.data = fs.readFileSync(this.DB_FILE);
            const worker = new Worker(workerPath, { workerData: { file: this.DB_FILE } });

            worker.on('message', (data) => {
                this.data = data;
                // console.log('Database initialized.' + data);
            });
            worker.on('error', (err) => {
                console.error('Worker error:', err);
            });
        }
        console.log('Database initialized.');
    }
    //function to save it
    saveDB() {
        const workerPath = path.join(__dirname, 'dbWorker.js');
        const worker = new Worker(workerPath, { workerData: { file: this.DB_FILE, data: this.data } });
        worker.on('message', () => {
            console.log('Database saved to disk.');
        });
        worker.on('error', (err) => {
            console.error('Worker error:', err);
        });
    }

    startAutoSave() {
        this.autoSaveTimer = setInterval(() => {
            this.saveDB();
            console.log('Auto-saved database to disk.');
        }, this.autosaveInterval);
    }

    handleProcessExit() {
     
        const saveAndExit = () => {
            this.saveDB();
            console.log('Process exiting, database saved.');
            process.exit();
        };

        process.on('exit', () => {
            this.saveDB();
            console.log('Process exiting, database saved.');
        });

        process.on('SIGHUP', function() {
            console.log('About to exit');
            this.saveDB();
            console.log('Process exiting, database saved.');
            process.exit();
          });

        process.on('SIGINT', saveAndExit);
        process.on('SIGTERM', saveAndExit);

        process.on('uncaughtException', (err) => {
            console.error('Uncaught exception:', err);
            this.saveDB();
            process.exit(1);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled rejection at:', promise, 'reason:', reason);
            this.saveDB();
            process.exit(1);
        });
    }

    GetAllcollections() {
        const allDocuments = Object.entries(this.data.collections)
            .map(([id, data]) => ({ id, ...data }));
            // .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            

        return allDocuments.slice(0, Object.keys(this.data).length);
    }

    collection(name) {
        if (!this.data.collections[name]) {
            this.data.collections[name] = {};
            this.data.indexes[name] = {};
            // console.log(`Collection '${name}' created.`);
        } else {
            // console.log(`Collection '${name}' already exists.`);
        }
        return new Collection(name, this.data, this);
    }

    deleteCollection(name) {
        if (this.data.collections[name]) {
            delete this.data.collections[name];
            delete this.data.indexes[name];
            // console.log(`Collection '${name}' deleted.`);
        } else {
            // console.log(`Collection '${name}' does not exist.`);
        }
    }

    setUploadDirectory(directory) {
        UPLOAD_DIR = path.resolve(directory);
        if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR);
        }
        // console.log(`Ścieżka zapisu plików ustawiona na: ${UPLOAD_DIR}`);
    }
}

class Collection {
    constructor(name, data, db) {
        this.name = name;
        if (data.collections && data.indexes) {
            // For main collections
            this.data = data.collections[name];
            // this.indexes = data.indexes[name];
            this.files = data.files;
        } else {
            // For sub-collections
            this.data = data[name] || {};
            // this.indexes = {};
            this.files = {};
        }
        this.db = db;
        // console.log(`Initialized collection '${name}'.`);
    }


    getDocumentByIndexAsync(data, index) {
        return new Promise((resolve, reject) => {
            const worker = new Worker('./worker.js', { workerData: { data, index } });
            worker.on('message', resolve);
            worker.on('error', reject);
            worker.on('exit', (code) => {
                if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
            });
        });
    }
    getDocumentByIndex(index) {
        const collectionData = this.data;
        // console.log(collectionData);
        const keys = Object.keys(collectionData);
        // console.log(keys);
        const key = keys[index];
        // console.log(key);
        return { id: key, document: this.data[key] };
    }

    add(documentData, documentIds = uuidv4()) {
        const documentId = documentIds;
        const timestamp = new Date().toISOString();

        this.data[documentId] = { ...documentData, createdAt: timestamp, collections: {} };
        // this.updateIndexes(documentId, documentData);
        // this.db.saveDB();
        // console.log(`Added document ${documentId} to collection '${this.name}'.`);
        return documentId;
    }

    collection(documentId, subCollectionName) {
        const document = this.data[documentId] || null;
        if (!document) {
            // console.log(`Document ${documentId} does not exist.`);
            return null;
        }

        if (!document.collections[subCollectionName]) {
            document.collections[subCollectionName] = {};
            this.db.saveDB();
        }

        return new Collection(subCollectionName, document.collections, this.db);
    }

    getDocumentById(id) {
        return this.data[id] || null;
    }

    // getDocumentByIdAsync(id) { // not workig shit
    //     let data = this.data;
    //     return new Promise((resolve, reject) => {
    //         const worker = new Worker('./workerid.js', { workerData: { data, id } });
    //         worker.on('message', resolve);
    //         worker.on('error', reject);
    //         worker.on('exit', (code) => {
    //             if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    //         });
    //     });
    // }

    update(documentId, updates) {
        if (!this.data[documentId]) {
            // console.log(`Document ${documentId} does not exist.`);
            return false;
        }

        Object.assign(this.data[documentId], updates);
        // this.updateIndexes(documentId, this.data[documentId]);
        // this.db.saveDB();
        // console.log(`Updated document ${documentId} in collection '${this.name}'.`);
        return true;
    }

    delete(documentId) {
        if (!this.data[documentId]) {
            console.warn(`Document ${documentId} does not exist.`);
            return false;
        }

        // console.log(`Deleting document ${documentId}`);
        const keys = Object.keys(this.data);
        const index = keys.indexOf(documentId);
        if (index > -1) {
            const newData = Object.fromEntries(keys.slice(0, index).concat(keys.slice(index + 1)).map(key => [key, this.data[key]]));
            this.data = newData;
        }

        // Verify if the document is removed from this.data
        if (this.data.hasOwnProperty(documentId)) {
            console.warn(`Failed to delete document ${documentId} from memory.`);
            return false;
        }

        // this.removeFromIndexes(documentId);
        // this.db.saveDB();
        // console.log(`Deleted document ${documentId} from collection '${this.name}'.`);
        return true;
    }

    count() {
        return Object.keys(this.data).length;
    }

    find(documentId) {
        return this.data[documentId] || null;
    }

    paginate(startIndex, pageSize) {
        const allDocuments = Object.entries(this.data)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        return allDocuments.slice(startIndex, startIndex + pageSize);
    }

    GetAllDocuments() {
        const allDocuments = Object.entries(this.data)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        return allDocuments.slice(0, Object.keys(this.data).length);
    }

    saveFile(documentId, fieldName, fileBuffer, fileName) {
        const fileHash = crypto.createHash("md5").update(fileBuffer).digest("hex");
        const filePath = path.join(UPLOAD_DIR, `${fileHash}-${fileName}`);

        if (!this.files[fileHash]) {
            fs.writeFileSync(filePath, fileBuffer);
            this.files[fileHash] = filePath;
            // console.log(`file saved as ${filePath}.`);
        } else {
            // console.log(`File exist as: ${filePath}.`);
        }

        if (!this.data[documentId]) {
            // console.log(`Document ${documentId} does not exist.`);
            return null;
        }
        this.data[documentId][fieldName] = filePath;
        this.db.saveDB();

        return filePath;
    }

    findAndUpdate(documentId, updates) {
        const document = this.find(documentId);
        if (!document) {
            // console.log(`Document ${documentId} does not exist.`);
            return false;
        }

        this.update(documentId, updates);
        // console.log(`Document ${documentId} updated.`);
        return true;
    }


}

class SubCollection extends Collection {
    constructor(documentData, db) {
        super();
        this.documentData = documentData;
        this.db = db;
    }

    collection(name) {
        if (!this.documentData.collections[name]) {
            this.documentData.collections[name] = {};
            this.db.saveDB();
        }
        return new Collection(name, this.documentData.collections, this.db);
    }
}

if (require.main === module) {
    console.log("This file is not use as standalone code!");
    process.exit(1);
}

// const Db = new Database("unnehdb.unnehDB");
module.exports = Database;